import type { DailyJournalData } from "../lib/DailyJournalData";
import { HistoryEntry } from "../lib/useHistoryState";
import { generateUuid } from "../lib/uuid";

const DB_NAME = "HistoryStateDB";
const STORE_NAME = "entries";
const DB_VERSION = 1;
const CHANNEL_NAME = "dailyjournalbuilder-history-session";

const otherInactiveSessionIds = new Set<string>();
const sessionIdPromise = getOrCreateSessionIdAsync();

// After the current session is established, clean up any old entries from inactive sessions.
// Just to make sure we aren't building up a bunch of old, unused sessions.
sessionIdPromise.then(async (currentSessionId) => {
  if (otherInactiveSessionIds.size === 0) return;

  const db = await openDB();
  const entries: Array<HistoryEntry<DailyJournalData> & { sessionId: string; created?: number }> = await new Promise(
    (resolve, reject) => {
      const tx = db.transaction(STORE_NAME, "readonly");
      const store = tx.objectStore(STORE_NAME);
      const req = store.getAll();
      req.onsuccess = () =>
        resolve(req.result as Array<HistoryEntry<DailyJournalData> & { sessionId: string; created?: number }>);
      req.onerror = () => reject(req.error);
    },
  );

  if (!entries.length) return;

  // Map sessionId to latest created timestamp
  const sessionMap = new Map<string, number>();
  for (const entry of entries) {
    if (entry.sessionId === currentSessionId) continue;

    const created = entry.created ?? 0;
    if (!sessionMap.has(entry.sessionId) || sessionMap.get(entry.sessionId)! < created) {
      sessionMap.set(entry.sessionId, created);
    }
  }

  // Find inactive sessions that haven't been changed in at least 30 days
  const CLEANUP_THRESHOLD_MS = 30 * 24 * 60 * 60 * 1000;
  const now = Date.now();
  const activeSessionIds = await getActiveSessionIds();
  let removeCounter = 0;
  for (const [sid, latestCreated] of sessionMap.entries()) {
    if (activeSessionIds.has(sid) || sid === currentSessionId) continue;

    if (now - latestCreated > CLEANUP_THRESHOLD_MS) {
      // Delete all entries for this session
      await new Promise<void>((resolve, reject) => {
        const tx = db.transaction(STORE_NAME, "readwrite");
        const store = tx.objectStore(STORE_NAME);
        const range = IDBKeyRange.bound([sid, 0], [sid, Number.MAX_SAFE_INTEGER]);
        const getReq = store.getAllKeys(range);
        getReq.onsuccess = () => {
          const keys = getReq.result as [string, number][];
          let pending = keys.length;
          if (pending === 0) return resolve();
          keys.forEach((key) => {
            const delReq = store.delete(key);
            delReq.onsuccess = () => {
              removeCounter++;
              pending--;
              if (pending === 0) resolve();
            };
            delReq.onerror = () => reject(delReq.error);
          });
        };
        getReq.onerror = () => reject(getReq.error);
      });
      otherInactiveSessionIds.delete(sid);
    }
  }
});

async function getOrCreateSessionIdAsync() {
  const existingSessionIdsPromise = getExistingSessionIds();
  const activeSessionsPromise = getActiveSessionIds();

  let availableSessionId: string | undefined;
  const existingSessionIds = await existingSessionIdsPromise;
  if (existingSessionIds.length > 0) {
    const activeSessionIds = await activeSessionsPromise;
    const inactiveSessionIds = existingSessionIds.filter((sid) => !activeSessionIds.has(sid));
    if (inactiveSessionIds.length > 0) {
      availableSessionId = inactiveSessionIds[0];
      for (let i = 1; i < inactiveSessionIds.length; i++) {
        otherInactiveSessionIds.add(inactiveSessionIds[i]);
      }
    }
  }
  const sessionId = availableSessionId ?? generateUuid();
  setupSessionResponder(sessionId);
  return sessionId;
}

// To detect active sessions in other tabs, we'll use a broadcast channel and respond to "ping" messages with our current session id.
// So we can broadcast "ping" to that channel to find other active sessions.

function setupSessionResponder(sessionId: string) {
  const channel = new BroadcastChannel(CHANNEL_NAME);
  channel.onmessage = (event) => {
    if (event.data?.type === "ping") {
      console.log("pong", sessionId);
      channel.postMessage({ type: "pong", sessionId });
    }
  };
  window.addEventListener("unload", () => channel.close());
}

async function getActiveSessionIds(timeout = 500): Promise<Set<string>> {
  return new Promise((resolve) => {
    const channel = new BroadcastChannel(CHANNEL_NAME);
    const activeSessions = new Set<string>();
    channel.onmessage = (event) => {
      if (event.data?.type === "pong" && event.data.sessionId) {
        console.log("pong received", event.data.sessionId);
        activeSessions.add(event.data.sessionId);
      }
    };
    console.log("ping start");
    channel.postMessage({ type: "ping" });
    setTimeout(() => {
      channel.close();
      console.log("ping end");
      resolve(activeSessions);
    }, timeout);
  });
}

function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: ["sessionId", "key"] });
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

async function getExistingSessionIds(): Promise<string[]> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, "readonly");
    const store = tx.objectStore(STORE_NAME);
    const req = store.getAll();
    req.onsuccess = () => {
      const entries = req.result as Array<HistoryEntry<DailyJournalData> & { sessionId: string; created?: number }>;
      if (!entries.length) return resolve([]);
      // Map sessionId to latest created timestamp
      const sessionMap = new Map<string, number>();
      for (const entry of entries) {
        const created = entry.created ?? 0;
        if (!sessionMap.has(entry.sessionId) || sessionMap.get(entry.sessionId)! < created) {
          sessionMap.set(entry.sessionId, created);
        }
      }
      // Sort sessionIds by latest timestamp descending
      const ordered = Array.from(sessionMap.entries())
        .sort((a, b) => b[1] - a[1])
        .map(([sid]) => sid);
      resolve(ordered);
    };
    req.onerror = () => reject(req.error);
  });
}

export async function getAllEntries(): Promise<HistoryEntry<DailyJournalData>[]> {
  const sessionId = await sessionIdPromise;
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, "readonly");
    const store = tx.objectStore(STORE_NAME);
    const range = IDBKeyRange.bound([sessionId, 0], [sessionId, Number.MAX_SAFE_INTEGER]);
    const req = store.getAll(range);
    req.onsuccess = () => resolve(req.result as HistoryEntry<DailyJournalData>[]);
    req.onerror = () => reject(req.error);
  });
}

export async function setEntry(entry: HistoryEntry<DailyJournalData>): Promise<void> {
  const sessionId = await sessionIdPromise;
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, "readwrite");
    const store = tx.objectStore(STORE_NAME);
    const req = store.put({ ...entry, sessionId: sessionId, created: Date.now() });
    req.onsuccess = () => resolve();
    req.onerror = () => reject(req.error);
  });
}

export async function removeEntries(ids: number[]): Promise<void> {
  if (ids.length === 0) return;

  const sessionId = await sessionIdPromise;
  const db = await openDB();
  await new Promise<void>((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, "readwrite");
    const store = tx.objectStore(STORE_NAME);
    let pending = ids.length;
    if (pending === 0) return resolve();
    ids.forEach((id) => {
      const req = store.delete([sessionId, id]);
      req.onsuccess = () => {
        pending--;
        if (pending === 0) resolve();
      };
      req.onerror = () => reject(req.error);
    });
  });
}

export async function clearEntries(): Promise<void> {
  const sessionId = await sessionIdPromise;
  const db = await openDB();

  let removeCounter = 0;
  await new Promise<void>((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, "readwrite");
    const store = tx.objectStore(STORE_NAME);
    const range = IDBKeyRange.bound([sessionId, 0], [sessionId, Number.MAX_SAFE_INTEGER]);
    const getReq = store.getAllKeys(range);
    getReq.onsuccess = () => {
      const keys = getReq.result as [string, number][];
      let pending = keys.length;
      if (pending === 0) return resolve();
      keys.forEach((key) => {
        const delReq = store.delete(key);
        delReq.onsuccess = () => {
          removeCounter++;
          pending--;
          if (pending === 0) resolve();
        };
        delReq.onerror = () => reject(delReq.error);
      });
    };
    getReq.onerror = () => reject(getReq.error);
  });

  // Clear other inactive sessions
  if (otherInactiveSessionIds.size > 0) {
    const activeSessionIds = await getActiveSessionIds();
    for (const sid of otherInactiveSessionIds) {
      if (activeSessionIds.has(sid)) continue;

      await new Promise<void>((resolve, reject) => {
        const tx = db.transaction(STORE_NAME, "readwrite");
        const store = tx.objectStore(STORE_NAME);
        const range = IDBKeyRange.bound([sid, 0], [sid, Number.MAX_SAFE_INTEGER]);
        const getReq = store.getAllKeys(range);
        getReq.onsuccess = () => {
          const keys = getReq.result as [string, number][];
          let pending = keys.length;
          if (pending === 0) return resolve();
          keys.forEach((key) => {
            const delReq = store.delete(key);
            delReq.onsuccess = () => {
              removeCounter++;
              pending--;
              if (pending === 0) resolve();
            };
            delReq.onerror = () => reject(delReq.error);
          });
        };
        getReq.onerror = () => reject(getReq.error);
      });
    }
  }
}
