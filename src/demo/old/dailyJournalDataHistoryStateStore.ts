import type { DailyJournalData } from "../../lib/DailyJournalData";
import { HistoryStateStore } from "../../lib/useHistoryState";
import type { IndexedDBHistoryStateStoreEvent } from "./historyStateStore";
import { createIndexedDBHistoryStateStore } from "./historyStateStore";

// export async function saveStoredImage(imageId: string, imageBlob: Blob): Promise<void> {
//   const root = await navigator.storage.getDirectory();
//   const imagesDir = await root.getDirectoryHandle("images", { create: true });
//   const fileHandle = await imagesDir.getFileHandle(imageId, { create: true });
//   const writable = await fileHandle.createWritable();
//   await writable.write(imageBlob);
//   await writable.close();
// }

export async function createStoredImage(imageId: string, imageBlob: Blob): Promise<string> {
  const root = await navigator.storage.getDirectory();
  const imagesDir = await root.getDirectoryHandle("images", { create: true });

  // Check if file exists
  let finalId = imageId;
  let exists = false;
  try {
    await imagesDir.getFileHandle(imageId, { create: false });
    exists = true;
  } catch {
    exists = false;
  }

  // If exists, generate a new unique id
  if (exists) {
    const ext = imageId.includes(".") ? imageId.substring(imageId.lastIndexOf(".")) : "";
    const base = imageId.replace(ext, "");
    let counter = 1;
    do {
      finalId = `${base}_${Date.now()}${counter}${ext}`;
      try {
        await imagesDir.getFileHandle(finalId, { create: false });
        counter++;
      } catch {
        break;
      }
    } while (counter <= 3);
  }

  const fileHandle = await imagesDir.getFileHandle(finalId, { create: true });
  const writable = await fileHandle.createWritable();
  await writable.write(imageBlob);
  await writable.close();

  return finalId;
}

export async function getStoredImage(imageId: string): Promise<Blob | null> {
  const root = await navigator.storage.getDirectory();
  const imagesDir = await root.getDirectoryHandle("images", { create: false }).catch(() => null);
  if (!imagesDir) return null;
  const fileHandle = await imagesDir.getFileHandle(imageId, { create: false }).catch(() => null);
  if (!fileHandle) return null;
  const file = await fileHandle.getFile();
  return file;
}

async function getOldStoredImageIds(): Promise<string[]> {
  const root = await navigator.storage.getDirectory();
  const imagesDir = await root.getDirectoryHandle("images", { create: false }).catch(() => null);
  if (!imagesDir) return [];
  const now = Date.now();
  const unused: string[] = [];
  for await (const [name, handle] of imagesDir.entries()) {
    if (handle.kind === "file") {
      try {
        const file = await (handle as FileSystemFileHandle).getFile();
        const minAgeMs = 15_000 * 60;
        if (now - file.lastModified > minAgeMs) {
          unused.push(name);
        }
      } catch {
        // Ignore errors
      }
    }
  }
  return unused;
}

async function deleteStoredImages(imageIds: string[]) {
  const root = await navigator.storage.getDirectory();
  const imagesDir = await root.getDirectoryHandle("images", { create: false }).catch(() => null);
  if (!imagesDir) return;
  for (const id of imageIds) {
    await imagesDir.removeEntry(id).catch(() => {});
  }
}

async function getAllReferencedImageIds(
  context: IndexedDBHistoryStateStoreEvent<DailyJournalData>,
): Promise<Set<string>> {
  const entries = await context.getAllEntries();
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

function createGCIndexedDBHistoryStateStore(): HistoryStateStore<DailyJournalData> {
  let gcTimeout: ReturnType<typeof setTimeout> | null = null;
  const store = createIndexedDBHistoryStateStore<DailyJournalData>({
    onRemoved: async (context) => {
      if (gcTimeout) clearTimeout(gcTimeout);
      gcTimeout = setTimeout(async () => {
        const referencedImageIds = await getAllReferencedImageIds(context);
        const storedImageIds = await getOldStoredImageIds();
        const unusedImageIds = storedImageIds.filter((id) => !referencedImageIds.has(id));
        if (unusedImageIds.length > 0) {
          await deleteStoredImages(unusedImageIds);
        }
        gcTimeout = null;
      }, 10_000);
    },
  });

  return store;
}

export { createGCIndexedDBHistoryStateStore };
