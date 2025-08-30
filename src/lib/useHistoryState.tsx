import React from "react";

const MAX_HISTORY = 50;

export interface HistoryState<T> {
  state: T;
  set: (newPresent: T) => void;
  undo: () => void;
  redo: () => void;
  clear: () => void;
  canUndo: boolean;
  canRedo: boolean;
  get future(): readonly T[];
  get past(): readonly T[];
  isPending: boolean;
}

export interface HistoryStateOptions<T> {
  store?: HistoryStateStore<T>;
}

export interface HistoryStateStore<T> {
  getAllEntries: () => Promise<HistoryEntry<T>[]>;
  setEntry: (entry: HistoryEntry<T>) => Promise<void>;
  removeEntries: (ids: number[]) => Promise<void>;
  clear: () => Promise<void>;
}

export interface HistoryEntry<T> {
  key: number;
  value: T;
  isFuture?: boolean;
}

type HistoryStateInternal<T> = {
  past: KeyValuePair<number, T>[];
  present: KeyValuePair<number, T>;
  future: KeyValuePair<number, T>[];
};

interface KeyValuePair<TKey, TValue> {
  key: TKey;
  value: TValue;
}

export function useHistoryState<T>(initialPresent: T, options?: HistoryStateOptions<T>): HistoryState<T> {
  const initialPresentRef = React.useRef(initialPresent);
  const store = options?.store;

  const [history, setHistory] = React.useState<HistoryStateInternal<T>>({
    past: [],
    present: { key: 1, value: initialPresentRef.current },
    future: [],
  });

  const [isLoaded, setIsLoaded] = React.useState(!store);
  React.useEffect(() => {
    if (!store) {
      return;
    }

    let cancelled = false;
    store.getAllEntries().then((entries) => {
      if (cancelled) {
        return;
      }
      if (entries.length > 0) {
        const sortedEntries = [...entries].sort(compareEntries);
        const past: KeyValuePair<number, T>[] = [];
        const future: KeyValuePair<number, T>[] = [];
        let present: KeyValuePair<number, T> | undefined = undefined;
        for (const entry of sortedEntries) {
          if (entry.isFuture) {
            future.push(entry);
          } else {
            if (present) past.push(present);
            present = { key: entry.key, value: entry.value };
          }
        }
        if (present) {
          setHistory({ past, present, future });
        }
      }
      setIsLoaded(true);
    });
    return () => {
      cancelled = true;
    };
  }, [store, setHistory, setIsLoaded]);

  const set = React.useCallback(
    (newValue: T) => {
      if (newValue === history.present.value) return;

      const newPresent = { key: getNextKey(history), value: newValue };

      let deletedKeys = [...history.future.map((x) => x.key)];
      let newPast = [...history.past, history.present];
      if (newPast.length > MAX_HISTORY) {
        deletedKeys = [...newPast.slice(0, newPast.length - MAX_HISTORY).map((x) => x.key), ...deletedKeys];
        newPast = newPast.slice(newPast.length - MAX_HISTORY);
      }

      setHistory({ past: newPast, present: newPresent, future: [] });

      if (store) {
        store.setEntry(newPresent).then(() => {
          if (deletedKeys.length > 0) return store.removeEntries(deletedKeys);
        });
      }
    },
    [history, store],
  );

  const undo = React.useCallback(() => {
    if (history.past.length <= 0) return;

    const newPast = history.past.slice(0, history.past.length - 1);
    const newPresent = history.past[history.past.length - 1];
    const newFuture = [history.present, ...history.future];
    setHistory({ past: newPast, present: newPresent, future: newFuture });

    if (store) {
      store.setEntry({ ...history.present, isFuture: true });
    }
  }, [history, store]);

  const redo = React.useCallback(() => {
    if (history.future.length <= 0) return;

    const newPast = [...history.past, history.present];
    const newPresent = history.future[0];
    const newFuture = history.future.slice(1);
    setHistory({ past: newPast, present: newPresent, future: newFuture });

    if (store) {
      store.setEntry({ ...newPresent });
    }
  }, [history, store]);

  const clear = React.useCallback(() => {
    const newPresent: HistoryEntry<T> = { key: 1, value: initialPresentRef.current };
    setHistory({ past: [], present: newPresent, future: [] });

    if (store) {
      store.clear().then(() => {
        return store.setEntry({ ...newPresent });
      });
    }
  }, [history.past, history.future, store, initialPresentRef]);

  const getPast = React.useCallback(() => {
    return Object.freeze(history.past.map((e) => e.value));
  }, [history.past]);

  const getFuture = React.useCallback(() => {
    return Object.freeze(history.future.map((e) => e.value));
  }, [history.future]);

  if (!isLoaded) {
    return {
      state: initialPresentRef.current,
      set: () => {},
      undo: () => {},
      redo: () => {},
      clear: () => {},
      canUndo: false,
      canRedo: false,
      get past() {
        return [];
      },
      get future() {
        return [];
      },
      isPending: true,
    };
  }

  const result: Omit<HistoryState<T>, "past" | "future"> = {
    state: history.present.value,
    set,
    undo,
    redo,
    clear,
    canUndo: history.past.length > 0,
    canRedo: history.future.length > 0,
    isPending: !isLoaded,
  };
  Object.defineProperty(result, "past", { get: getPast });
  Object.defineProperty(result, "future", { get: getFuture });
  return result as HistoryState<T>;
}

const KEY_ROLLOVER = 1_000_000;
const KEY_ROLLOVER_THRESHOLD = KEY_ROLLOVER / 2;

function compareEntries(a: HistoryEntry<any>, b: HistoryEntry<any>): number {
  const diff = (a.key - b.key + KEY_ROLLOVER) % KEY_ROLLOVER;
  if (diff === 0) return 0;
  return diff < KEY_ROLLOVER_THRESHOLD ? 1 : -1;
}

function getNextKey(history: HistoryStateInternal<any>): number {
  let lastEntry = history.present;
  for (const entry of history.past) {
    if (compareEntries(entry, lastEntry) > 0) {
      lastEntry = entry;
    }
  }
  for (const entry of history.future) {
    if (compareEntries(entry, lastEntry) > 0) {
      lastEntry = entry;
    }
  }
  return (lastEntry.key % KEY_ROLLOVER) + 1;
}

//function getNextKey<T>(history: HistoryStateInternal<T>): number {
//   let lastKey = 0;
//   for (const { key } of history.past) {
//     lastKey = Math.max(lastKey, key);
//   }
//   lastKey = Math.max(lastKey, history.present.key);
//   for (const { key } of history.future) {
//     lastKey = Math.max(lastKey, key);
//   }
//   return (lastKey % KEY_ROLLOVER) + 1;
// }
