import React, { startTransition } from "react";
import { convertToCssOrPdfProperties, CssOrPdfProperties } from "./CssOrPdfProperties";
import { DailyJournalData, convertDailyJournalDataToDocument } from "./DailyJournalData";
import { DailyJournalDocument, DailyJournalDocumentContext, DailyJournalDocumentItemBox } from "./DailyJournalDocument";
import type { Style as ReactPdfStyle } from "@react-pdf/types";
import type {
  DailyJournalHeaderOrFooterItem,
  DailyJournalImageItem,
  DailyJournalItem,
  DailyJournalTextBoxItem,
} from "./DailyJournalItem";
import { ItemBoxButton } from "./ItemBoxButton";
import type { LengthValue } from "./LengthValue";
import {
  convertLengthValueToInchesString,
  convertLengthValueToPx,
  convertLengthValueToPxOrUndefined,
} from "./LengthValue";
import type {
  RichTextNode,
  RichTextTextNode,
  TextBoxData,
  TextBoxStyle,
  RichTextRootNode,
  RichTextElementNode,
} from "./TextBoxData";
import {
  calculateTextBoxDataHeightPx,
  calculateTextBoxDataScaledFontSizePtString,
  calculateTextBoxDataWidthPx,
  convertLexicalEditorStateToTextBoxData,
  convertTextBoxDataToLexicalInitialEditorState,
} from "./TextBoxData";
import { saveAs } from "./fileSaver";
import { FontFace } from "./fonts/FontFace";
import { WebFonts } from "./fonts/WebFonts";
import { standardFonts } from "./fonts/standardFonts";
import { IconArrowClockwise, IconArrowCounterclockwise, IconFileEarmarkPlus, IconPlus } from "./icons";
import { resizeImageAsync } from "./imageResizer";
import { Layout, LayoutItem, buildLayout } from "./layoutBuilder";
import { generatePdfBlob } from "./reactPdfDocumentGenerator";
import { EditorComposer } from "./rich-text-editor/EditorComposer";
import { useEditor } from "./rich-text-editor/useEditor";
import { TextBoxEditor } from "./text-box-editor/TextBoxEditor";
import { convertWidthTypeToLengthValue } from "./text-box-editor/WidthType";
import { OptionalText } from "./ui/OptionalText";
import { useModal } from "./ui/useModal";
import { useHistoryState } from "./useHistoryState";
import { generateUuid } from "./uuid";
import { convertSizeToInchesStringOrUndefined } from "./text-box-editor/Size";
import { useAsync } from "./useAsync";

export interface DailyJournalBuilderProps {
  initialData?: Partial<DailyJournalData>;
  resolveImageFile: (name: string) => Promise<File | Blob>;
  onImageFilesUploaded: (files: FileList) => Promise<Map<File, string>>;
}

const IS_APPLE: boolean = /Mac|iPod|iPhone|iPad/.test(navigator.platform);

export function DailyJournalBuilder(props: DailyJournalBuilderProps) {
  const { initialData, resolveImageFile, onImageFilesUploaded } = props;

  const resolveFontFaces = (fontFamily: string) => {
    const fontFaces = standardFonts.filter((x) => x.fontFamily === fontFamily);
    return Promise.resolve(fontFaces);
  };

  const {
    state: dailyJournalData,
    set: setDailyJournalData,
    canUndo,
    canRedo,
    undo,
    redo,
  } = useHistoryState<DailyJournalData>(createDefaultDailyJournalInputData(initialData));
  const [layout, setLayout] = React.useState<Layout<DailyJournalLayoutItem> | undefined>(undefined);
  const [modal, showModal] = useModal();

  const items = React.useMemo(() => dailyJournalData.items, [dailyJournalData]);
  const setHeader = (newHeader: DailyJournalHeaderOrFooterItem | undefined) => {
    const newDailyJournalInputData: DailyJournalData = {
      ...dailyJournalData,
      header: newHeader,
    };
    setDailyJournalData(newDailyJournalInputData);
  };
  const setItems = (newItems: DailyJournalItem[]) => {
    if (dailyJournalData.items === newItems) {
      return;
    }
    const newDailyJournalInputData: DailyJournalData = {
      ...dailyJournalData,
      items: newItems,
    };
    setDailyJournalData(newDailyJournalInputData);
  };

  const dailyJournalDocument = React.useMemo(() => {
    return convertDailyJournalDataToDocument(dailyJournalData, layout);
  }, [dailyJournalData, layout]);

  const pageWidth = dailyJournalData.style.width;
  const pageHeight = dailyJournalData.style.height;
  const gap = dailyJournalData.style.gap;

  const layoutWidth = pageWidth - dailyJournalData.style.paddingLeft - dailyJournalData.style.paddingRight;
  let layoutHeight = pageHeight - dailyJournalData.style.paddingTop - dailyJournalData.style.paddingBottom;
  if (dailyJournalData.header) {
    layoutHeight -= dailyJournalData.header.height - dailyJournalData.style.gap;
  }
  if (dailyJournalData.footer) {
    layoutHeight -= dailyJournalData.footer.height - dailyJournalData.style.gap;
  }

  React.useEffect(() => {
    const layoutItems: DailyJournalLayoutItem[] = items.map((item, i) => ({
      key: `${item.type}-${item.name}`,
      width: item.width,
      height: item.height,
      flexibleAspectRatio: item.type === "textBox",
      featured: item.featured,
      //rowSpan: item.rowSpan,
      innerItem: item,
    }));
    const t0 = performance.now();
    const layout = buildLayout(layoutItems, {
      layoutWidth: layoutWidth,
      layoutHeight: layoutHeight,
      gap,
    });
    const t1 = performance.now();
    console.log("Layout took " + (t1 - t0) + " milliseconds.");

    if (layout) {
      for (const cell of layout.cells) {
        if (cell.item.innerItem.type === "textBox") {
          cell.item.fontSizeOverride = calculateTextBoxDataScaledFontSizePtString(
            cell.item.innerItem.data,
            cell.width,
            cell.height,
          );
        }
      }
    }

    const t2 = performance.now();
    console.log("Font size calculation took " + (t2 - t1) + " milliseconds.");

    //React.startTransition(() => {
    setLayout(layout);
    //});
  }, [items]);

  const handleNew = () => {
    const newDailyJournalInputData = { ...dailyJournalData };
    newDailyJournalInputData.header = createNewHeader(dailyJournalData.header);
    newDailyJournalInputData.items = [];
    newDailyJournalInputData.footer = undefined;
    setDailyJournalData(newDailyJournalInputData);
  };

  function createNewHeader(oldHeader?: DailyJournalHeaderOrFooterItem) {
    const oldLayoutContainer = oldHeader?.data?.richText?.children?.find((x) => x.type === "layoutContainer");
    const oldTitleTextNode = oldLayoutContainer?.children
      ?.find((x) => x.type === "layoutItem")
      ?.children?.find((x) => x.type === "paragraph")
      ?.children?.find((x) => x.type === "text") as RichTextTextNode | undefined;
    const newTitleTextNode: RichTextTextNode = {
      type: "text",
      style: { ...oldTitleTextNode?.style },
      text: oldTitleTextNode?.text ?? "",
    };

    const dateString = new Date().toLocaleDateString("default", { year: "numeric", month: "long", day: "numeric" });
    const newDateTextNode: RichTextTextNode = {
      type: "text",
      style: { ...newTitleTextNode.style },
      text: dateString,
    };

    const richText: RichTextRootNode = {
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
                  children: [newTitleTextNode],
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
                  children: [newDateTextNode],
                  style: {
                    textAlign: "center",
                  },
                },
              ],
            },
          ],
        },
      ],
    };

    const textBoxData: TextBoxData = {
      style: {
        fontFamily: "Arimo",
        fontSize: "24pt",
        borderStyle: "solid",
        borderWidth: 10,
        ...oldHeader?.data?.style,
        width: layoutWidth,
      },
      richText,
    };

    const width = calculateTextBoxDataWidthPx(textBoxData);
    const height = calculateTextBoxDataHeightPx(textBoxData);

    const newHeader: DailyJournalHeaderOrFooterItem = {
      type: "textBox",
      name: "header",
      width,
      height,
      data: textBoxData,
    };
    console.log("newHeader", width, newHeader);
    return newHeader;
  }

  function handleAddTextBox() {
    showModal({
      getContent: (onClose) => {
        const handleSave = (textBoxData: TextBoxData) => {
          if (!textBoxData.style) {
            textBoxData.style = {};
          }
          if (!textBoxData.style.width) {
            textBoxData.style.width = layoutWidth;
          }
          const width = calculateTextBoxDataWidthPx(textBoxData);
          const height = calculateTextBoxDataHeightPx(textBoxData);

          const name = `${generateUuid()}.json`;
          const newItem: DailyJournalTextBoxItem = { type: "textBox", name, width, height, data: textBoxData };
          const newItems = [...items];
          newItems.push(newItem);
          setItems(newItems);
        };
        return (
          <TextBoxEditorModalContentComposer
            initialData={undefined}
            onSave={handleSave}
            onClose={onClose}
            pageWidth={pageWidth}
          />
        );
      },
      size: "xl",
    });
  }

  async function handleFileListUploaded(fileList: FileList | null | undefined) {
    if (!fileList) {
      return;
    }

    const nameMap = await onImageFilesUploaded(fileList);

    const uploadedItems: DailyJournalItem[] = [];
    for (const file of fileList) {
      console.log("file", file);
      let size: { width: number; height: number };
      try {
        size = await loadImageSizeAsync(file);
      } catch (err) {
        console.error("Failed to load file as image", err);
        continue;
      }

      const name = nameMap.get(file) ?? file.name;
      const uploadedItem: DailyJournalImageItem = {
        type: "image",
        name: name,
        width: size.width,
        height: size.height,
      };
      uploadedItems.push(uploadedItem);
    }

    if (uploadedItems.length > 0) {
      const newItems = items.concat(uploadedItems);
      setItems(newItems);
    }

    // const root = await navigator.storage.getDirectory();
    // const imagesHandle = await root.getDirectoryHandle("images");
    // for (const file of fileList) {
    //   imagesHandle.getFileHandle(file.name, { });
    // }
  }

  const loadImageSizeAsync = (file: File) => {
    return new Promise<{ width: number; height: number }>((resolve, reject) => {
      const img = new window.Image();
      const objectUrl = URL.createObjectURL(file);
      img.onload = () => {
        URL.revokeObjectURL(objectUrl);
        resolve({ width: img.naturalWidth, height: img.naturalHeight });
      };
      img.onerror = (err) => {
        URL.revokeObjectURL(objectUrl);
        reject(err);
      };
      img.src = objectUrl;
    });
  };

  const handleMoveStart = (item: DailyJournalItem) => {
    const i = items.indexOf(item);
    if (i <= 0) {
      return;
    }

    const newItems = [...items];
    newItems[i] = newItems[0];
    newItems[0] = item;
    setItems(newItems);
  };

  const handleMoveLeft = (item: DailyJournalItem) => {
    const i = items.indexOf(item);
    if (i <= 0) {
      return;
    }

    const newItems = [...items];
    newItems[i] = newItems[i - 1];
    newItems[i - 1] = item;
    setItems(newItems);
  };

  const handleMoveRight = (item: DailyJournalItem) => {
    const i = items.indexOf(item);
    if (i < 0 || i >= items.length - 1) {
      return;
    }

    const newItems = [...items];
    newItems[i] = newItems[i + 1];
    newItems[i + 1] = item;
    setItems(newItems);
  };

  const handleMoveEnd = (item: DailyJournalItem) => {
    const i = items.indexOf(item);
    if (i < 0 || i >= items.length - 1) {
      return;
    }

    const newItems = [...items];
    newItems[i] = newItems[items.length - 1];
    newItems[items.length - 1] = item;
    setItems(newItems);
  };

  const handleToggleFeatured = (item: DailyJournalItem) => {
    const i = items.indexOf(item);
    if (i < 0) {
      return;
    }

    const newFeatured = item.featured ? undefined : true;
    const newItem: DailyJournalItem = { ...item, featured: newFeatured };
    const newItems = [...items];
    newItems.splice(i, 1, newItem);
    setItems(newItems);
  };

  const handleEdit = (item: DailyJournalItem) => {
    console.log("edit");
    if (item.type === "textBox") {
      const isHeader = item.name === "header";
      showModal({
        getContent: (onClose) => {
          const handleSave = (textBoxData: TextBoxData) => {
            if (!textBoxData.style) {
              textBoxData.style = {};
            }
            if (!textBoxData.style.width) {
              textBoxData.style.width = layoutWidth;
            }
            const width = calculateTextBoxDataWidthPx(textBoxData);
            const height = calculateTextBoxDataHeightPx(textBoxData);

            if (isHeader) {
              const newHeader: DailyJournalHeaderOrFooterItem = {
                type: "textBox",
                name: "header",
                width,
                height,
                data: textBoxData,
              };
              setHeader(newHeader);
            } else {
              const i = items.indexOf(item);
              if (i < 0) {
                return;
              }
              const newItem: DailyJournalTextBoxItem = { ...item, width, height, data: textBoxData };
              const newItems = [...items];
              newItems.splice(i, 1, newItem);
              setItems(newItems);
            }
          };
          return (
            <TextBoxEditorModalContentComposer
              initialData={item.data}
              onSave={handleSave}
              onClose={onClose}
              pageWidth={pageWidth}
            />
          );
        },
        size: "xl",
      });
      return;
    }

    if (item.type === "image") {
      showModal({
        getContent: (onClose) => {
          return (
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Edit</h5>
                <button type="button" className="btn-close" aria-label="Close" onClick={onClose}></button>
              </div>
              <div className="modal-body">
                <p>Test</p>
              </div>
              <div className="modal-footer">
                <div className="btn-toolbar justify-content-end">
                  <div className="btn-group">
                    <button type="button" className="btn btn-secondary" onClick={onClose}>
                      Close
                    </button>
                  </div>
                </div>
              </div>
            </div>
          );
        },
        size: "xl",
      });
      return;
    }
  };

  const handleDelete = (item: DailyJournalItem) => {
    const isHeader = item.type === "textBox" && item.name === "header";
    if (isHeader) {
      const newHeader = createNewHeader();
      setHeader(newHeader);
      return;
    }

    const i = items.indexOf(item);
    if (i < 0) {
      return;
    }

    const newItems = [...items];
    newItems.splice(i, 1);
    setItems(newItems);
  };

  const handleUndo = () => {
    if (!canUndo) {
      return;
    }
    undo();
  };

  const handleRedo = () => {
    if (!canRedo) {
      return;
    }
    redo();
  };

  const handleDownloadPdf = async () => {
    if (!dailyJournalDocument) {
      return;
    }

    const context = await generateDocumentContextAsync({
      dailyJournalDocument,
      layout,
      resolveImageFile,
      resolveFontFaces,
    });
    if (!context) {
      return;
    }

    const pdfBlob = await generatePdfBlob(dailyJournalDocument, context);
    if (!pdfBlob) {
      return;
    }

    // TODO: try to get date from header before falling back to now
    const now = new Date();
    const dateStr = `${now.getFullYear().toString().padStart(4, "0")}-${(now.getMonth() + 1).toString().padStart(2, "0")}--${now.getDate().toString().padStart(2, "0")}`;
    const fileName = `dailyjournal-${dateStr}.pdf`;
    await saveAs(pdfBlob, fileName);
  };

  return (
    <React.Fragment>
      <WebFonts fonts={standardFonts} />
      {modal}
      <section
        style={{
          color: "black",
          backgroundColor: "#E6E6E6",
          minWidth: "fit-content",
        }}
      >
        <header className="container">
          <div className="btn-toolbar gap-1">
            <div className="btn-group">
              <button
                type="button"
                className="btn btn-secondary"
                onClick={handleUndo}
                disabled={!canUndo}
                title={IS_APPLE ? "Undo (⌘Z)" : "Undo (Ctrl+Z)"}
                aria-label="Undo"
              >
                <IconArrowCounterclockwise />
              </button>

              <button
                type="button"
                className="btn btn-secondary"
                onClick={handleRedo}
                disabled={!canRedo}
                title={IS_APPLE ? "Redo (⌘Y)" : "Redo (Ctrl+Y)"}
                aria-label="Redo"
              >
                <IconArrowClockwise />
              </button>
            </div>
            <div className="btn-group">
              <button type="button" className="btn btn-secondary" onClick={handleNew} title="New" aria-label="New">
                <IconFileEarmarkPlus /> <OptionalText>New</OptionalText>
              </button>
              <FileUploadButton onFileListUploaded={handleFileListUploaded}>
                <IconPlus /> Picture
              </FileUploadButton>
              <button
                type="button"
                className="btn btn-secondary"
                onClick={handleAddTextBox}
                title="Add Text"
                aria-label="Add Text"
              >
                <IconPlus /> Text
              </button>
            </div>
            <div className="btn-group">
              <button
                type="button"
                className="btn btn-secondary"
                disabled={!layout}
                title="Download PDF"
                aria-label="Download PDF"
                onClick={handleDownloadPdf}
              >
                Download PDF
              </button>
            </div>
          </div>
        </header>

        <div className="container">
          <article
            style={{
              color: "black",
              backgroundColor: "white",
              boxShadow: "0 0.5em 1em rgba(0, 0, 0, 0.15)",
              boxSizing: "border-box",
              ...dailyJournalDocument.style,
              // paddingTop: convertLengthValueToInchesString(paddingVertical),
              // paddingBottom: convertLengthValueToInchesString(paddingVertical),
              // paddingLeft: convertLengthValueToInchesString(paddingHorizontal),
              // paddingRight: convertLengthValueToInchesString(paddingHorizontal),
              // width: convertLengthValueToInchesString(pageWidth),
              // height: convertLengthValueToInchesString(pageHeight),
              // position: "relative",
            }}
          >
            {!dailyJournalData.header && <React.Fragment></React.Fragment>}
            {dailyJournalDocument.itemBoxes.map((itemBox, i) => {
              const item = itemBox.item;
              const itemIndex = items.indexOf(item);
              return (
                <div key={itemBox.key} style={itemBox.style}>
                  <ItemBoxButton
                    itemBox={itemBox}
                    onClickMoveStart={itemIndex > 0 ? handleMoveStart.bind(undefined, item) : undefined}
                    onClickMoveLeft={itemIndex > 0 ? handleMoveLeft.bind(undefined, item) : undefined}
                    onClickMoveRight={itemIndex < items.length - 1 ? handleMoveRight.bind(undefined, item) : undefined}
                    onClickMoveEnd={itemIndex < items.length - 1 ? handleMoveEnd.bind(undefined, item) : undefined}
                    onClickToggleFeatured={handleToggleFeatured.bind(undefined, item)}
                    onClickEdit={handleEdit.bind(undefined, item)}
                    onClickDelete={handleDelete.bind(undefined, item)}
                  >
                    {item.type === "image" && <ImageWrapper itemBox={itemBox} resolveImageFile={resolveImageFile} />}
                    {item.type === "textBox" && (
                      <TextBoxDataView
                        data={item.data}
                        cellWidth={itemBox.style.width}
                        cellHeight={itemBox.style.height}
                        fontSizeOverride={itemBox.style.fontSize}
                      />
                    )}
                  </ItemBoxButton>
                </div>
              );
            })}
          </article>
        </div>

        {/* <hr />
        <TextBoxEditor pageWidth={pageSize.width} /> */}
      </section>
    </React.Fragment>
  );
}

function createDefaultDailyJournalInputData(initialDailyJournalData: Partial<DailyJournalData> | undefined) {
  const pageWidth = convertLengthValueToPx("8.5in");
  const pageHeight = convertLengthValueToPx("11in");
  const paddingHorizontal = convertLengthValueToPx(".25in");
  const paddingVertical = convertLengthValueToPx(".25in");
  const gap = 5;
  const data: DailyJournalData = {
    style: {
      width: pageWidth,
      height: pageHeight,
      paddingLeft: paddingHorizontal,
      paddingRight: paddingHorizontal,
      paddingTop: paddingVertical,
      paddingBottom: paddingVertical,
      gap,
      ...(initialDailyJournalData?.style ?? {}),
    },
    header: initialDailyJournalData?.header,
    items: initialDailyJournalData?.items ?? [],
    footer: initialDailyJournalData?.footer,
  };
  return data;
}

type DailyJournalLayoutItem = LayoutItem & {
  innerItem: DailyJournalItem;

  /**
   * For a textBox item, the font size to use in the current layout.
   * This may be scaled down so the text fits in its layout cell.
   */
  fontSizeOverride?: string;
};

interface ImageWrapperProps {
  itemBox: DailyJournalDocumentItemBox;
  resolveImageFile: (name: string) => Promise<File | Blob>;
}

function ImageWrapper(props: ImageWrapperProps) {
  const { itemBox, resolveImageFile } = props;

  const imageName = itemBox.item.name;
  const imageFilePromise = React.useMemo(
    () =>
      resolveImageFile(imageName).catch((err) => {
        console.error(`Failed to load image file for name "${imageName}"`, err);
        return undefined;
      }),
    [imageName],
  );

  return (
    <React.Suspense
      fallback={
        <div className="spinner-border" role="status">
          <span className="sr-only">Loading...</span>
        </div>
      }
    >
      <Image
        imageFilePromise={imageFilePromise}
        imageWidth={itemBox.item.width}
        imageHeight={itemBox.item.height}
        width={itemBox.style.width}
        height={itemBox.style.height}
      />
    </React.Suspense>
  );
}

interface ImageProps {
  imageFilePromise: Promise<File | Blob | undefined>;
  imageWidth: number;
  imageHeight: number;
  width: `${number}in` | "0";
  height: `${number}in` | "0";
}

function Image(props: ImageProps) {
  const { imageFilePromise, imageWidth, imageHeight, width, height } = props;

  //const imageFile = React.use(imageFilePromise);
  const { data: imageFile, isPending, error } = useAsync(imageFilePromise);
  const [imageObjectUrl, setImageObjectUrl] = React.useState<string | undefined>();
  React.useEffect(() => {
    if (!imageFile || isPending || error) {
      // Empty placeholder image
      //startTransition(() => {
      setImageObjectUrl(`data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg"/>`);
      //});
      return;
    }

    const objectURL = URL.createObjectURL(imageFile);
    //startTransition(() => {
    setImageObjectUrl(objectURL);
    //});
    return () => {
      URL.revokeObjectURL(objectURL);
    };
  }, [imageFile]);

  // if (isPending) {
  //   return (
  //     <div className="spinner-border" role="status">
  //       <span className="sr-only">Loading...</span>
  //     </div>
  //   );
  // }

  return (
    <img
      src={imageObjectUrl}
      alt=""
      width={imageWidth}
      height={imageHeight}
      style={{
        objectFit: "contain",
        boxSizing: "border-box",
        width: convertLengthValueToInchesString(width),
        height: convertLengthValueToInchesString(height),
      }}
    />
  );
}

// interface FileUploadZoneProps {
//   onFileListUploaded(fileList: FileList | null | undefined): Promise<void>;
// }

// function FileUploadZone(props: FileUploadZoneProps) {
//   const { onFileListUploaded } = props;
//   const [submitting, setSubmitting] = React.useState(false);
//   return (
//     <div
//       style={{ border: "1px solid black", height: "100px" }}
//       onDragOver={(e) => {
//         e.preventDefault();
//         console.log("drag over");
//       }}
//       onDragEnter={(e) => {
//         e.preventDefault();
//         console.log("drag enter");
//       }}
//       onDragLeave={(e) => {
//         e.preventDefault();
//         console.log("drag leave");
//       }}
//       onDrop={(e) => {
//         e.preventDefault();
//         console.log("drop", e);
//         onFileListUploaded(e.dataTransfer.files);
//       }}
//     >
//       Drop Pictures Here
//       <div>
//         <input
//           type="file"
//           accept="image/*"
//           multiple
//           placeholder="Pictures"
//           disabled={submitting}
//           onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
//             e.preventDefault();
//             if (submitting) {
//               return;
//             }

//             setSubmitting(true);
//             onFileListUploaded(e.target.files).finally(() => {
//               e.target.value = "";
//               setSubmitting(false);
//             });
//           }}
//         />
//       </div>
//     </div>
//   );
// }

function TextBoxDataView({
  data,
  cellWidth,
  cellHeight,
  fontSizeOverride,
}: {
  data: TextBoxData;
  cellWidth: LengthValue | undefined;
  cellHeight: LengthValue | undefined;
  fontSizeOverride: string | undefined;
}) {
  const { width, minHeight, fontSize, ...otherStyle } = convertToCssOrPdfProperties(data.style) ?? {};
  //console.log("TextBoxDataView", fontSize, fontSizeOverride);
  const style: React.CSSProperties = {
    boxSizing: "border-box",
    width: cellWidth ? convertLengthValueToInchesString(cellWidth) : "100%",
    height: cellHeight ? convertLengthValueToInchesString(cellHeight) : "100%",
    fontSize: fontSizeOverride ?? fontSize,
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "pre-wrap",
    ...otherStyle,
  };

  let parentWidth = convertLengthValueToPxOrUndefined(cellWidth) ?? 0;
  if (otherStyle.marginLeft) {
    parentWidth -= convertLengthValueToPx(otherStyle.marginLeft);
  }
  if (otherStyle.marginRight) {
    parentWidth -= convertLengthValueToPx(otherStyle.marginRight);
  }
  if (otherStyle.paddingLeft) {
    parentWidth -= convertLengthValueToPx(otherStyle.paddingLeft);
  }
  if (otherStyle.paddingRight) {
    parentWidth -= convertLengthValueToPx(otherStyle.paddingRight);
  }

  let parentHeight = convertLengthValueToPxOrUndefined(cellHeight) ?? 0;
  if (otherStyle.marginTop) {
    parentHeight -= convertLengthValueToPx(otherStyle.marginTop);
  }
  if (otherStyle.marginBottom) {
    parentHeight -= convertLengthValueToPx(otherStyle.marginBottom);
  }
  if (otherStyle.paddingTop) {
    parentHeight -= convertLengthValueToPx(otherStyle.paddingTop);
  }
  if (otherStyle.paddingBottom) {
    parentHeight -= convertLengthValueToPx(otherStyle.paddingBottom);
  }

  if (otherStyle.borderWidth) {
    parentWidth -= convertLengthValueToPx(otherStyle.borderWidth) * 2;
    parentHeight -= convertLengthValueToPx(otherStyle.borderWidth) * 2;
  }

  const result = (
    <div style={style}>
      {data.richText ? (
        <RichTextNodeView
          node={data.richText}
          parent={undefined}
          parentWidth={parentWidth}
          parentHeight={parentHeight}
        />
      ) : (
        (data.text ?? "")
      )}
    </div>
  );
  return result;
}

const allowFlexbox = true;
function RichTextNodeView({
  node,
  parent,
  parentWidth,
  parentHeight,
}: {
  node: RichTextNode;
  parent: RichTextElementNode | undefined;
  parentWidth: LengthValue | undefined;
  parentHeight: LengthValue | undefined;
}) {
  if (node.type === "text") {
    return <span style={convertToCssOrPdfProperties(node.style)}>{node.text}</span>;
  }

  let Tag: React.ElementType;
  if (node.type === "paragraph") {
    Tag = "p";
  } else {
    Tag = "div";
  }

  let style = convertToCssOrPdfProperties(node.style);
  if (node.type === "layoutContainer") {
    if (allowFlexbox) {
      style = {
        ...style,
        display: "flex",
        flexDirection: "row",
        flexWrap: "nowrap",
        justifyContent: "space-between",
        alignItems: "center",
      };
    } else {
      style = {
        ...style,
        position: "relative",
      };
    }
  } else if (node.type === "layoutItem") {
    if (allowFlexbox) {
      style = { ...style, flexGrow: 1 };
    } else {
      const rowItemCount = Math.max(parent?.children.length ?? 0, 1);
      const rowItemIndex = Math.max(parent?.children?.indexOf(node) ?? -1, 0);
      const itemWidth = (convertLengthValueToPxOrUndefined(parentWidth) ?? 0) / rowItemCount;
      const left = itemWidth * rowItemIndex;
      let justifyContent: CssOrPdfProperties["justifyContent"] | undefined;
      if (style?.textAlign === "left") {
        justifyContent = "flex-start";
      } else if (style?.textAlign === "right") {
        justifyContent = "flex-end";
      } else {
        justifyContent = style?.textAlign;
      }

      style = {
        ...style,
        position: "absolute",
        left: convertLengthValueToInchesString(left),
        top: "0",
        width: convertLengthValueToInchesString(itemWidth),
        height: convertLengthValueToInchesString(parentHeight),
        display: "flex",
        alignItems: "center",
        justifyContent,
      };
    }
  }

  return (
    <Tag style={style}>
      {node.children.map((childNode, i) => (
        <RichTextNodeView
          key={i}
          node={childNode}
          parent={node}
          parentWidth={parentWidth}
          parentHeight={parentHeight}
        />
      ))}
    </Tag>
  );
}

function TextBoxEditorModalContentComposer({
  initialData,
  onSave,
  onClose,
  pageWidth,
}: {
  initialData: TextBoxData | undefined;
  onSave: (textBoxData: TextBoxData) => void;
  onClose: () => void;
  pageWidth: number;
}) {
  const initialEditorState = convertTextBoxDataToLexicalInitialEditorState(initialData);
  return (
    <EditorComposer initialEditorState={initialEditorState}>
      <TextBoxEditorModalContent
        initialStyle={initialData?.style}
        onSave={onSave}
        onClose={onClose}
        pageWidth={pageWidth}
      />
    </EditorComposer>
  );
}

function TextBoxEditorModalContent({
  initialStyle,
  onSave,
  onClose,
  pageWidth,
}: {
  initialStyle: TextBoxStyle | undefined;
  onSave: (textBoxData: TextBoxData) => void;
  onClose: () => void;
  pageWidth: number;
}) {
  const editor = useEditor();
  const [textBoxStyle, setTextBoxStyle] = React.useState<TextBoxStyle>(
    initialStyle ?? {
      fontFamily: "Arial",
      fontSize: "14pt",
      width: convertWidthTypeToLengthValue("50%", convertLengthValueToPxOrUndefined(pageWidth)),
      color: "#000000",
      backgroundColor: "#ffffff",
      paddingLeft: 8,
      paddingBottom: 8,
      paddingRight: 8,
      paddingTop: 8,
    },
  );

  const handleClickSave = () => {
    const editorState = editor.getEditorState();
    editorState.read(() => {
      const serializedEditorState = editorState.toJSON();
      //console.log("save serializedEditorState", serializedEditorState, JSON.stringify(editorState, undefined, 2));
      const textBoxData = convertLexicalEditorStateToTextBoxData(serializedEditorState);
      textBoxData.style = textBoxStyle;
      //console.log("save textBoxData", textBoxData);
      onSave(textBoxData);
      onClose();
    });
  };
  return (
    <div className="modal-content">
      <div className="modal-header">
        <h5 className="modal-title">Edit</h5>
        <button type="button" className="btn-close" aria-label="Close" onClick={onClose}></button>
      </div>
      <div className="modal-body">
        <TextBoxEditor
          textBoxStyle={textBoxStyle}
          setTextBoxStyle={setTextBoxStyle}
          pageWidth={pageWidth}
          fonts={standardFonts}
        />
      </div>
      <div className="modal-footer">
        <div className="btn-toolbar justify-content-end">
          <div className="btn-group">
            <button type="button" className="btn btn-primary" onClick={handleClickSave}>
              Save
            </button>
            <button type="button" className="btn btn-secondary" onClick={onClose}>
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// function DownloadPdfButton(props: DownloadPdfLinkProps) {
//   // const [downloadObjectUrl, setDownloadObjectUrl] = React.useState<string | undefined>();
//   // React.useEffect(() => {
//   //   if (!props.layout) {
//   //     return undefined;
//   //   }

//   //   let objectURL: string | undefined;
//   //   generateDocumentAsync(props)
//   //     .then((document) => (document ? generatePdfBlob(document) : undefined))
//   //     .then((pdfBlob) => {
//   //       objectURL = pdfBlob ? URL.createObjectURL(pdfBlob) : undefined;
//   //       setDownloadObjectUrl(objectURL);
//   //     })
//   //     .catch((err) => {
//   //       console.error(err);
//   //     });

//   //   return () => {
//   //     if (objectURL) {
//   //       URL.revokeObjectURL(objectURL);
//   //     }
//   //   };
//   // }, [props.layout, props.pageSize, props.margin]);

//   return (
//     <button
//       type="button"
//       className="btn btn-secondary"
//       title="Download PDF"
//       aria-label="Download PDF"
//       onClick={handleDownloadPdf}
//     >
//       Download PDF
//     </button>
//   );
// }

async function generateDocumentContextAsync(props: {
  dailyJournalDocument: DailyJournalDocument;
  layout: Layout<DailyJournalLayoutItem> | undefined;
  resolveImageFile: (name: string) => Promise<File | Blob>;
  resolveFontFaces: (fontFamily: string) => Promise<FontFace[]>;
}): Promise<DailyJournalDocumentContext | undefined> {
  const { dailyJournalDocument, layout, resolveImageFile, resolveFontFaces } = props;
  if (!layout) {
    return undefined;
  }

  const fonts: FontFace[] = [];
  const resolvedFontFamilies = new Set<string>();
  const imagesRecord: Record<string, File | Blob> = {};

  for (const itemBox of dailyJournalDocument.itemBoxes) {
    const item = itemBox.item;
    if (
      item.type === "textBox" &&
      item.data.style?.fontFamily &&
      !resolvedFontFamilies.has(item.data.style.fontFamily)
    ) {
      const familyFonts = await resolveFontFaces(item.data.style.fontFamily);

      // // If there is no match for this font, then remove it from the cell's style (or the PDF will fail to generate).
      // if (!familyFonts || familyFonts.length === 0) {
      //   const documentCellIndex = documentCells.indexOf(cell);
      //   if (documentCellIndex >= 0) {
      //     const newStyle = { ...item.data.style, fontFamily: undefined };
      //     const newData = { ...item.data, style: newStyle };
      //     const newItem = { ...item, data: newData };
      //     const newCell = { ...cell, item: newItem };
      //     documentCells[documentCellIndex] = newCell as LayoutCell<any>;
      //   }
      // }

      fonts.push(...familyFonts);
    }
  }

  for (const cell of layout.cells) {
    const item = cell.item.innerItem;
    if (item.type === "image" && item.name) {
      let imageFile = await resolveImageFile(item.name);

      // If the image is much bigger than the target size in the PDF, then we'll resize it down.
      if (imageFile) {
        const targetWidth = cell.width * 3;
        const targetHeight = cell.height * 3;
        if (item.width > targetWidth || item.height > targetHeight) {
          // Resize the image down to the target
          console.log(`Resizing image ${item.name} from width ${item.width} to ${targetWidth}`);
          const resizedImageFile = await resizeImageAsync(imageFile, targetWidth, targetHeight);
          if (resizedImageFile) {
            imageFile = resizedImageFile;
          }
        }
      }

      if (imageFile) {
        imagesRecord[item.name] = imageFile;
      }
    }
  }

  const documentContext: DailyJournalDocumentContext = {
    imagesRecord,
    fonts,
  };
  return documentContext;
}

interface FileUploadButtonProps {
  onFileListUploaded(fileList: FileList | null | undefined): Promise<void>;
  children?: React.ReactNode;
}

function FileUploadButton(props: FileUploadButtonProps) {
  const { onFileListUploaded, children } = props;
  const [submitting, setSubmitting] = React.useState(false);

  return (
    <label className="btn btn-secondary">
      <input
        type="file"
        accept="image/*"
        multiple
        hidden
        disabled={submitting}
        onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
          e.preventDefault();
          if (submitting) {
            return;
          }

          setSubmitting(true);
          onFileListUploaded(e.target.files).finally(() => {
            e.target.value = "";
            setSubmitting(false);
          });
        }}
      />
      {children}
    </label>
  );
}
