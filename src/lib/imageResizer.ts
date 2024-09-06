const workerScript = `
async function resizeImageAsync(file, newWidth, newHeight) {
  const imageBitmap = await createImageBitmap(file);

  const offscreenCanvas = new OffscreenCanvas(newWidth, newHeight);
  const ctx = offscreenCanvas.getContext("2d");
  if (!ctx) {
    throw new Error("Unable to create OffscreenCanvasRenderingContext2D");
  }

  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = "high";
  ctx.drawImage(imageBitmap, 0, 0, newWidth, newHeight);

  let inputType = file.type;
  let outputType = "image/jpg";
  let quality = 0.9;
  if (inputType === "image/png" || inputType === "image/gif" || inputType === "image/bmp") {
    outputType = "image/png";
    quality = undefined;
  }
  const blob = await offscreenCanvas.convertToBlob({ type: outputType, quality });
  return blob;
}

self.onmessage = async function(event) {
    const { file, newWidth, newHeight } = event.data;
    try {
        const resizedBlob = await resizeImageAsync(file, newWidth, newHeight);
        self.postMessage({ resizedBlob });
    } catch (error) {
        self.postMessage({ error });
    }
};
`;

type MessageData = SuccessMessageData | ErrorMessageData;

interface SuccessMessageData {
  resizedBlob: Blob;
  error?: undefined;
}

interface ErrorMessageData {
  resizedBlob?: undefined;
  error: Error;
}

export async function resizeImageAsync(file: File | Blob, newWidth: number, newHeight: number): Promise<Blob> {
  const workerScriptBlob = new Blob([workerScript], { type: "application/javascript" });
  const workerScriptUrl = URL.createObjectURL(workerScriptBlob);
  try {
    return await new Promise((resolve, reject) => {
      const worker = new Worker(workerScriptUrl);
      worker.onmessage = (event) => {
        const data: MessageData = event.data;
        if (data.error) {
          reject(data.error);
          return;
        }
        if (!data.resizedBlob) {
          reject(new Error("Failed to resize image"));
          return;
        }
        resolve(data.resizedBlob);
      };
      worker.postMessage({ file, newWidth, newHeight });
    });
  } finally {
    URL.revokeObjectURL(workerScriptUrl);
  }
}
