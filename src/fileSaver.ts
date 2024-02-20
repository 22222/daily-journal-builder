/*
 * FileSaver.js
 * A saveAs() FileSaver implementation.
 *
 * By Eli Grey, http://eligrey.com
 *
 * License : https://github.com/eligrey/FileSaver.js/blob/master/LICENSE.md (MIT)
 * source  : http://purl.eligrey.com/github/FileSaver.js
 */

/**
 * FileSaver.js implements the saveAs() FileSaver interface in browsers that do not natively support it.
 *
 * @param blob - The actual file data blob.
 * @param filename - The optional name of the file to be downloaded. If omitted, the name used in the file data will be used. If none is provided "download" will be used.
 */
// eslint-disable-next-line
export function saveAs(blob: Blob | File, name?: string): Promise<void> {
  const URL = window.URL || window.webkitURL;
  const a = document.createElement("a");
  name = name ?? (blob as File)?.name ?? "download";

  a.download = name;
  a.rel = "noopener"; // tabnabbing

  // Support blobs
  a.href = URL.createObjectURL(blob);
  setTimeout(function () {
    URL.revokeObjectURL(a.href);
  }, 4e4); // 40s

  return new Promise<void>((resolve, reject) => {
    setTimeout(function () {
      // `a.click()` doesn't work for all browsers (#465)
      try {
        a.dispatchEvent(new MouseEvent("click"));
        resolve();
      } catch (err) {
        try {
          const evt = document.createEvent("MouseEvents");
          evt.initMouseEvent("click", true, true, window, 0, 0, 0, 80, 20, false, false, false, false, 0, null);
          a.dispatchEvent(evt);
          resolve();
        } catch (err2) {
          reject(err2);
        }
      }
    }, 0);
  });
}
