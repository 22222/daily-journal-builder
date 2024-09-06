import React from "react";
import { DailyJournalBuilder, DailyJournalItem, DailyJournalData } from "../lib";
import { generateRandomImage, generateRandomDimension, newRandom } from "./randomData";

const includeRandomData = false;
const [initialImageRecord, initialData] = (() => {
  const imageRecord: Record<string, File | Blob> = {};

  const items: DailyJournalItem[] = [];
  if (includeRandomData) {
    const random = newRandom(2);
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
        // style: {
        //   width: 800,
        //   borderWidth: 10,
        //   borderStyle: "solid",
        //   borderRadius: 5,
        //   fontFamily: "Alice",
        //   fontSize: "32pt",
        // },
        // richText: {
        //   type: "root",
        //   children: [
        //     {
        //       type: "layoutContainer",
        //       children: [
        //         {
        //           type: "layoutItem",
        //           style: { textAlign: "center" },
        //           children: [{ type: "text", style: { fontWeight: "bold" }, text: "Daily Journal" }],
        //         },
        //         {
        //           type: "layoutItem",
        //           style: { textAlign: "center" },
        //           children: [{ type: "text", style: { fontWeight: "bold" }, text: "May 21, 2024" }],
        //         },
        //       ],
        //     },
        //   ],
        // },
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
          fontFamily: "Alice",
          fontSize: "30pt",
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

export function DailyJournalBuilderApp() {
  const [imageRecord, setImageRecord] = React.useState(initialImageRecord);

  const handleImageFilesUploaded = (fileList: FileList) => {
    const newImageRecord = { ...imageRecord };
    const result = new Map<File, string>();
    for (const file of fileList) {
      const name = file.name;
      if (!imageRecord[name]) {
        newImageRecord[name] = file;
      }
      result.set(file, name);
    }
    setImageRecord(newImageRecord);
    return Promise.resolve(result);
  };

  const resolveImageFile = (name: string) => {
    const fileOrBlob = imageRecord[name];
    if (!fileOrBlob) {
      return Promise.reject("Failed to find file for name " + name);
    }
    return Promise.resolve(fileOrBlob);
    // const img = imageMap.find((img) => img.id === name);
    // if (!img) {
    //   return Promise.reject("Failed to find file for name " + name);
    // }

    // return fetch(img.src)
    //   .then(function (res) {
    //     return res.arrayBuffer();
    //   })
    //   .then(function (buf) {
    //     return new File([buf], img.id, { type: "image/png" });
    //   });
  };

  return (
    <DailyJournalBuilder
      initialData={initialData}
      resolveImageFile={resolveImageFile}
      onImageFilesUploaded={handleImageFilesUploaded}
    />
  );
}

function convertDataUriToBlob(dataUri: string) {
  const byteString = atob(dataUri.split(",")[1]);
  const mimeString = dataUri.split(",")[0].split(":")[1].split(";")[0];
  const ab = new ArrayBuffer(byteString.length);
  const ia = new Uint8Array(ab);
  for (let i = 0; i < byteString.length; i++) {
    ia[i] = byteString.charCodeAt(i);
  }
  const blob = new Blob([ab], { type: mimeString });
  return blob;
}
