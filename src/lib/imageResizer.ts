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

// TODO: resize in a way that can be high quality in firefox?
// https://stackoverflow.com/questions/65406887/how-to-improve-smoothing-in-canvasrenderingcontext2d-in-firefox/65448582#65448582

async function resizeImageInternalAsync(file: File | Blob, newWidth: number, newHeight: number) {
  const imageBitmap = await createImageBitmap(file);

  const offscreenCanvas = new OffscreenCanvas(newWidth, newHeight);
  const ctx = offscreenCanvas.getContext("2d");
  if (!ctx) {
    throw new Error("Unable to create OffscreenCanvasRenderingContext2D");
  }

  let isResized = false;
  const isFirefox = navigator.userAgent.toLowerCase().includes("firefox");
  if (isFirefox) {
    isResized = await tryResizeImageManualAsync(imageBitmap, ctx, newWidth, newHeight);
  }

  if (!isResized) {
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = "high";
    ctx.drawImage(imageBitmap, 0, 0, newWidth, newHeight);
  }

  let inputType = file.type;
  let outputType = "image/jpg";
  let quality: number | undefined = 0.9;
  if (inputType === "image/png" || inputType === "image/gif" || inputType === "image/bmp") {
    outputType = "image/png";
    quality = undefined;
  }
  const blob = await offscreenCanvas.convertToBlob({ type: outputType, quality });
  return blob;
}

async function tryResizeImageManualAsync(
  imageBitmap: ImageBitmap,
  dCtx: CanvasImageData,
  newWidth: number,
  newHeight: number,
): Promise<boolean> {
  const srcWidth = imageBitmap.width;
  const srcHeight = imageBitmap.height;
  const xStep = srcWidth / newWidth;
  const yStep = srcHeight / newHeight;
  if (xStep < 2 || yStep < 2) {
    return false;
  }

  const srcCan = new OffscreenCanvas(srcWidth, srcHeight);
  const sCtx = srcCan.getContext("2d");
  if (!sCtx) {
    return false;
  }

  sCtx.drawImage(imageBitmap, 0, 0);
  const srcData = sCtx.getImageData(0, 0, srcWidth, srcHeight).data;
  const destData = dCtx.getImageData(0, 0, newWidth, newHeight);

  const area = xStep * yStep;
  const sD = srcData;
  const dD = destData.data;

  const RGB2sRGB = 2.2;
  const sRGB2RGB = 1 / RGB2sRGB;
  const sRGBMax = 255 ** RGB2sRGB;

  let x = 0;
  let y = 0;
  while (y < newHeight) {
    const sy = y * yStep;
    x = 0;
    while (x < newWidth) {
      const sx = x * xStep;
      const ssyB = sy + yStep;
      const ssxR = sx + xStep;
      let r = 0;
      let g = 0;
      let b = 0;
      let a = 0;
      let ssy = sy | 0;
      while (ssy < ssyB) {
        const yy1 = ssy + 1;
        const yArea = yy1 > ssyB ? ssyB - ssy : ssy < sy ? 1 - (sy - ssy) : 1;
        let ssx = sx | 0;
        while (ssx < ssxR) {
          const xx1 = ssx + 1;
          const xArea = xx1 > ssxR ? ssxR - ssx : ssx < sx ? 1 - (sx - ssx) : 1;
          const srcContribution = (yArea * xArea) / area;
          const idx = (ssy * srcWidth + ssx) * 4;
          r += (sD[idx] ** RGB2sRGB / sRGBMax) * srcContribution;
          g += (sD[idx + 1] ** RGB2sRGB / sRGBMax) * srcContribution;
          b += (sD[idx + 2] ** RGB2sRGB / sRGBMax) * srcContribution;
          a += (sD[idx + 3] / 255) * srcContribution;
          ssx += 1;
        }
        ssy += 1;
      }
      const idx = (y * newWidth + x) * 4;
      dD[idx] = (r * sRGBMax) ** sRGB2RGB;
      dD[idx + 1] = (g * sRGBMax) ** sRGB2RGB;
      dD[idx + 2] = (b * sRGBMax) ** sRGB2RGB;
      dD[idx + 3] = a * 255;
      x += 1;
    }
    y += 1;
  }
  dCtx.putImageData(destData, 0, 0);
  return true;
}

async function resizeImageInternal2Async(file: File | Blob, newWidth: number, newHeight: number) {
  const imageBitmap = await createImageBitmap(file);

  const srcWidth = imageBitmap.width;
  const srcHeight = imageBitmap.height;
  const xStep = srcWidth / newWidth;
  const yStep = srcHeight / newHeight;
  if (xStep < 2 || yStep < 2) {
    console.warn("Downsample too low. Should be at least 50%");
  }

  const srcCan = new OffscreenCanvas(srcWidth, srcHeight);
  const sCtx = srcCan.getContext("2d");
  if (!sCtx) {
    throw new Error("Unable to create OffscreenCanvasRenderingContext2D");
  }

  const destCan = new OffscreenCanvas(newWidth, newHeight);
  const dCtx = srcCan.getContext("2d");
  if (!dCtx) {
    throw new Error("Unable to create OffscreenCanvasRenderingContext2D");
  }

  sCtx.drawImage(imageBitmap, 0, 0);
  const srcData = sCtx.getImageData(0, 0, srcWidth, srcHeight).data;
  const destData = dCtx.getImageData(0, 0, newWidth, newHeight);

  const area = xStep * yStep;
  const sD = srcData;
  const dD = destData.data;

  const RGB2sRGB = 2.2;
  const sRGB2RGB = 1 / RGB2sRGB;
  const sRGBMax = 255 ** RGB2sRGB;

  let x = 0;
  let y = 0;
  while (y < newHeight) {
    const sy = y * yStep;
    x = 0;
    while (x < newWidth) {
      const sx = x * xStep;
      const ssyB = sy + yStep;
      const ssxR = sx + xStep;
      let r = 0;
      let g = 0;
      let b = 0;
      let a = 0;
      let ssy = sy | 0;
      while (ssy < ssyB) {
        const yy1 = ssy + 1;
        const yArea = yy1 > ssyB ? ssyB - ssy : ssy < sy ? 1 - (sy - ssy) : 1;
        let ssx = sx | 0;
        while (ssx < ssxR) {
          const xx1 = ssx + 1;
          const xArea = xx1 > ssxR ? ssxR - ssx : ssx < sx ? 1 - (sx - ssx) : 1;
          const srcContribution = (yArea * xArea) / area;
          const idx = (ssy * srcWidth + ssx) * 4;
          r += (sD[idx] ** RGB2sRGB / sRGBMax) * srcContribution;
          g += (sD[idx + 1] ** RGB2sRGB / sRGBMax) * srcContribution;
          b += (sD[idx + 2] ** RGB2sRGB / sRGBMax) * srcContribution;
          a += (sD[idx + 3] / 255) * srcContribution;
          ssx += 1;
        }
        ssy += 1;
      }
      const idx = (y * newWidth + x) * 4;
      dD[idx] = (r * sRGBMax) ** sRGB2RGB;
      dD[idx + 1] = (g * sRGBMax) ** sRGB2RGB;
      dD[idx + 2] = (b * sRGBMax) ** sRGB2RGB;
      dD[idx + 3] = a * 255;
      x += 1;
    }
    y += 1;
  }
  dCtx.putImageData(destData, 0, 0);

  let inputType = file.type;
  let outputType = "image/jpg";
  let quality: number | undefined = 0.9;
  if (inputType === "image/png" || inputType === "image/gif" || inputType === "image/bmp") {
    outputType = "image/png";
    quality = undefined;
  }
  const blob = await destCan.convertToBlob({ type: outputType, quality });
  return blob;
}
