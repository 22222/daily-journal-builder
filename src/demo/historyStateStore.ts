import type { DailyJournalData } from "../lib/DailyJournalData";
import { HistoryEntry, HistoryStateStore } from "../lib/useHistoryState";
import { clearStoredImages, deleteStoredImages, getOldStoredImageNames } from "./fileSystemStore";
import { clearEntries, getAllEntries, removeEntries, setEntry } from "./indexedDbStore";

export function createHistoryStateStore(): HistoryStateStore<DailyJournalData> {
  const store: HistoryStateStore<DailyJournalData> = {
    getAllEntries() {
      return getAllEntries();
    },
    async setEntry(entry: HistoryEntry<DailyJournalData>) {
      await setEntry(entry);
    },
    async removeEntries(ids: number[]) {
      await removeEntries(ids);
      garbageCollect();
    },
    async clear() {
      await clearEntries();
      await clearStoredImages();
    },
  };
  garbageCollect();
  return store;
}

let gcTimeout: ReturnType<typeof setTimeout> | null = null;
function garbageCollect() {
  if (gcTimeout) clearTimeout(gcTimeout);
  gcTimeout = setTimeout(async () => {
    try {
      const referencedImageIds = await getAllReferencedImageIds();
      const storedImageIds = await getOldStoredImageNames();
      const unusedImageIds = storedImageIds.filter((id) => !referencedImageIds.has(id));
      if (unusedImageIds.length > 0) {
        await deleteStoredImages(unusedImageIds);
      }
      gcTimeout = null;
    } catch (err) {
      console.error("Error during garbage collection", err);
    }
  }, 10_000);
}

async function getAllReferencedImageIds(): Promise<Set<string>> {
  const entries = await getAllEntries();
  const ids = new Set<string>();
  for (const entry of entries) {
    const data = entry.value;
    for (const item of data.items) {
      if (item.type === "image") {
        ids.add(item.name);
      }
    }
  }
  return ids;
}
