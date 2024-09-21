export async function createStoredImage(data: Blob | File, name: string): Promise<string> {
  let resolvedName = name;

  const root = await navigator.storage.getDirectory();
  const imagesDir = await root.getDirectoryHandle("images", { create: true });

  // Check if file exists
  let exists = false;
  try {
    await imagesDir.getFileHandle(name, { create: false });
    exists = true;
  } catch {
    exists = false;
  }

  // If exists, generate a new unique id
  if (exists) {
    const ext = name.includes(".") ? name.substring(name.lastIndexOf(".")) : "";
    const base = name.replace(ext, "");
    let counter = 1;
    do {
      resolvedName = `${base}_${Date.now()}${counter}${ext}`;
      try {
        await imagesDir.getFileHandle(resolvedName, { create: false });
        counter++;
      } catch {
        break;
      }
    } while (counter <= 3);
  }

  const fileHandle = await imagesDir.getFileHandle(resolvedName, { create: true });
  const writable = await fileHandle.createWritable();
  await writable.write(data);
  await writable.close();

  return resolvedName;
}

// export async function saveStoredImage(data: Blob, name: string): Promise<void> {
//   const root = await navigator.storage.getDirectory();
//   const imagesDir = await root.getDirectoryHandle("images", { create: true });
//   const fileHandle = await imagesDir.getFileHandle(name, { create: true });
//   const writable = await fileHandle.createWritable();
//   await writable.write(data);
//   await writable.close();
// }

export async function getStoredImage(name: string): Promise<File | undefined> {
  const root = await navigator.storage.getDirectory();
  const imagesDir = await root.getDirectoryHandle("images", { create: false }).catch(() => undefined);
  if (!imagesDir) return undefined;
  const fileHandle = await imagesDir.getFileHandle(name, { create: false }).catch(() => undefined);
  if (!fileHandle) return undefined;
  const file = await fileHandle.getFile();
  return file;
}

export async function getOldStoredImageNames(minAgeMs: number = 900_000): Promise<string[]> {
  const root = await navigator.storage.getDirectory();
  const imagesDir = await root.getDirectoryHandle("images", { create: false }).catch(() => undefined);
  if (!imagesDir) return [];
  const now = Date.now();
  const results: string[] = [];
  for await (const [name, handle] of imagesDir.entries()) {
    if (handle.kind === "file") {
      try {
        const file = await (handle as FileSystemFileHandle).getFile();
        if (!file.lastModified || now - file.lastModified > minAgeMs) {
          results.push(name);
        }
      } catch (err) {
        console.warn("Failed to process file " + name, err);
        results.push(name);
      }
    }
  }
  return results;
}

export async function deleteStoredImages(imageNames: string[]) {
  const root = await navigator.storage.getDirectory();
  const imagesDir = await root.getDirectoryHandle("images", { create: false }).catch(() => undefined);
  if (!imagesDir) return;
  for (const name of imageNames) {
    await imagesDir.removeEntry(name).catch(() => {});
  }
}

export async function clearStoredImages(): Promise<void> {
  const root = await navigator.storage.getDirectory();
  const imagesDir = await root.getDirectoryHandle("images", { create: false }).catch(() => undefined);
  if (!imagesDir) return;
  for await (const [name, handle] of imagesDir.entries()) {
    if (handle.kind === "file") {
      await imagesDir.removeEntry(name).catch(() => {});
    }
  }
}
