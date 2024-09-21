import React, { useMemo } from "react";
import { DailyJournalBuilder, DailyJournalData, DailyJournalItem } from "../lib";
import { resizeImageAsync } from "../lib/imageResizer";
import { convertLengthValueToPx } from "../lib/LengthValue";
import { createStoredImage, getStoredImage } from "./fileSystemStore";
import { createHistoryStateStore } from "./historyStateStore";
import { generateRandomDimension, generateRandomImage, newRandom } from "./randomData";

const includeRandomData = false;
const [initialImageRecord, initialData] = (() => {
  const imageRecord: Record<string, File | Blob> = {};

  const items: DailyJournalItem[] = [];
  if (includeRandomData) {
    const convertDataUriToBlob = (dataUri: string) => {
      const byteString = atob(dataUri.split(",")[1]);
      const mimeString = dataUri.split(",")[0].split(":")[1].split(";")[0];
      const ab = new ArrayBuffer(byteString.length);
      const ia = new Uint8Array(ab);
      for (let i = 0; i < byteString.length; i++) {
        ia[i] = byteString.charCodeAt(i);
      }
      const blob = new Blob([ab], { type: mimeString });
      return blob;
    };

    const random = newRandom(2);
    //const random = newRandom(4);
    for (let i = 0; i < 30; i++) {
      const img = generateRandomImage(undefined, undefined, random);
      const name = `image${i}.png`;
      imageRecord[name] = convertDataUriToBlob(img.src);

      items.push({ type: "image", name, width: img.width, height: img.height });
    }

    items.unshift({
      type: "textBox",
      name: "text001.json",
      width: 200,
      height: 96,
      data: {
        style: {
          width: 200,
          fontFamily: "Alice",
          fontSize: "16pt",
        },
        text: "A title!",
      },
    });

    const centerIndex = Math.max(((items.length - 1) / 2) | 0, 0);
    items.splice(centerIndex, 0, {
      type: "textBox",
      name: "text002.json",
      ...generateRandomDimension(random),
      data: {
        text: "This is some text",
        style: {
          borderStyle: "solid",
          borderRadius: 4,
          borderColor: "black",
          borderWidth: 16,
          paddingLeft: 16,
          paddingRight: 16,
          paddingTop: 16,
          paddingBottom: 16,
        },
      },
    });

    items.push({
      type: "textBox",
      name: "text003.json",
      ...generateRandomDimension(random),
      data: { text: "Footer" },
    });
  }

  const initialData: Partial<DailyJournalData> = {
    header: {
      type: "textBox",
      name: "header",
      width: 768,
      height: 100,
      data: {
        style: {
          width: 800,
          borderWidth: 10,
          borderStyle: "solid",
          borderRadius: 5,
          borderColor: "#000000",
          fontFamily: "Alice",
          fontSize: "30pt",
          color: "#000000",
          backgroundColor: "#ffffff",
          paddingBottom: 4,
          paddingLeft: 4,
          paddingRight: 4,
          paddingTop: 4,
        },
        richText: {
          type: "root",
          children: [
            {
              type: "layoutContainer",
              children: [
                {
                  type: "layoutItem",
                  style: { textAlign: "center" },
                  children: [
                    {
                      type: "paragraph",
                      children: [{ type: "text", style: { fontWeight: "bold" }, text: "Daily Journal" }],
                      style: {
                        textAlign: "center",
                      },
                    },
                  ],
                },
                {
                  type: "layoutItem",
                  style: { textAlign: "center" },
                  children: [
                    {
                      type: "paragraph",
                      children: [
                        {
                          type: "text",
                          style: { fontWeight: "bold" },
                          text: new Date().toLocaleDateString("default", {
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                          }),
                        },
                      ],
                      style: {
                        textAlign: "center",
                      },
                    },
                  ],
                },
              ],
            },
          ],
        },
      },
    },
    items,
  };

  return [imageRecord, initialData];
})();

const MAX_IMAGE_WIDTH = convertLengthValueToPx("8.5in") * 3;
const MAX_IMAGE_HEIGHT = convertLengthValueToPx("11in") * 3;

export function DailyJournalBuilderApp() {
  const [imageRecord, setImageRecord] = React.useState(initialImageRecord);

  const historyStateStore = useMemo(() => {
    return createHistoryStateStore();
  }, []);

  const handleImageFilesUploaded = async (fileList: FileList) => {
    const newImageRecord = { ...imageRecord };
    const result = new Map<File, string>();
    for (const file of fileList) {
      let name = file.name;

      // If we're going to store the file, we may want to resize it to reduce storage size.
      let fileForStorage: File | Blob = file;
      try {
        const fileSize = file.size;
        const RESIZE_THRESHOLD_FILE_SIZE = 1 * 1024 * 1024;
        if (!fileSize || fileSize > RESIZE_THRESHOLD_FILE_SIZE) {
          const { width, height } = await createImageBitmap(file);
          if (width > MAX_IMAGE_WIDTH || height > MAX_IMAGE_HEIGHT) {
            let targetWidth: number;
            let targetHeight: number;
            const aspectRatio = width / height;
            if (aspectRatio > 1) {
              targetWidth = MAX_IMAGE_WIDTH;
              targetHeight = Math.round(MAX_IMAGE_WIDTH / aspectRatio);
            } else {
              targetWidth = Math.round(MAX_IMAGE_HEIGHT * aspectRatio);
              targetHeight = MAX_IMAGE_HEIGHT;
            }
            const resizedImageFile = await resizeImageAsync(file, targetWidth, targetHeight);
            if (resizedImageFile) {
              fileForStorage = resizedImageFile;
            }
          }
        }
      } catch (err) {
        console.error("Failed to store image " + name, err);
      }

      // Store the image for future reference
      try {
        name = await createStoredImage(fileForStorage, name);
      } catch (err) {
        console.error("Failed to store image " + name, err);
      }

      if (!imageRecord[name]) {
        newImageRecord[name] = file;
      }
      result.set(file, name);
    }
    setImageRecord(newImageRecord);
    return result;
  };

  const resolveImageFile = async (name: string) => {
    let fileOrBlob = imageRecord[name];

    // If we didn't find the image, we may have to load it from storage.
    if (!fileOrBlob) {
      let storedFile: File | undefined;
      try {
        storedFile = await getStoredImage(name);
      } catch (err) {
        console.error("Failed to retrieve stored image " + name, err);
        storedFile = undefined;
      }

      if (storedFile) {
        imageRecord[name] = storedFile;
        fileOrBlob = storedFile;
      }
    }

    if (!fileOrBlob) {
      return Promise.reject("Failed to find file for name " + name);
    }

    return fileOrBlob;
  };

  return (
    <DailyJournalBuilder
      initialData={initialData}
      resolveImageFile={resolveImageFile}
      onImageFilesUploaded={handleImageFilesUploaded}
      historyStateStore={historyStateStore}
    />
  );
}
