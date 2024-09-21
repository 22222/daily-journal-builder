import type { ImageProps, TextBoxProps } from "./mspub-mht";
import { MhtPublisherDocument } from "./mspub-mht";

import { CssOrPdfProperties, convertToCssOrPdfProperties } from "./CssOrPdfProperties";
import type {
  DailyJournalDocument,
  DailyJournalDocumentContext,
  DailyJournalDocumentItemBox,
} from "./DailyJournalDocument";
import type { DailyJournalTextBoxItem } from "./DailyJournalItem";
import type { RichTextNode, RichTextRootNode } from "./TextBoxData";

export async function generatePubBlob(
  document: DailyJournalDocument,
  context: DailyJournalDocumentContext,
): Promise<Blob> {
  const doc = new MhtPublisherDocument();

  for (const itemBox of document.itemBoxes) {
    if (itemBox.item.type === "image") {
      const imageData = context.imagesRecord[itemBox.item.name];
      if (!imageData) {
        continue;
      }

      let imageType = convertImageTypeOrUndefined(imageData.type);
      if (!imageType && "name" in imageData) {
        imageType = convertImageTypeOrUndefined(imageData.name);
      }
      if (!imageType) {
        continue;
      }

      const imageBase64 = await convertBlobToBase64(imageData);
      doc.addImage(convertImageItemBoxToPub(itemBox, imageData, imageBase64));
    }
    if (itemBox.item.type === "textBox") {
      doc.addTextBox(convertTextBoxToPub(itemBox));
    }
  }

  const docString = doc.serializeToString();
  const blob = new Blob([docString], {
    type: "message/rfc822 ",
  });
  return blob;
}

function convertImageItemBoxToPub(
  itemBox: DailyJournalDocumentItemBox,
  imageData: File | Blob,
  imageBase64: string,
): ImageProps {
  let imageType = convertImageTypeOrUndefined(imageData.type);
  if (!imageType && "name" in imageData) {
    imageType = convertImageTypeOrUndefined(imageData.name);
  }

  if (itemBox.item.type !== "image") {
    throw new Error("Expected itemBox.item.type to be 'image'");
  }

  const result: ImageProps = {
    data: imageBase64,
    imageType: imageType,
    x: itemBox.style.left,
    y: itemBox.style.top,
    width: itemBox.style.width,
    height: itemBox.style.height,
  };
  return result;
}

function convertImageTypeOrUndefined(typeOrName: string | undefined): "jpeg" | "png" | "bmp" | undefined {
  if (!typeOrName) {
    return undefined;
  }

  let type = typeOrName.toLowerCase();
  if (type.startsWith("image/")) {
    type = type.substring("image/".length);
  } else if (type.includes(".")) {
    type = type.split(".").pop() ?? "";
  }

  if (type === "jpg" || type === "jpeg") {
    return "jpeg";
  }
  if (type === "png") {
    return "png";
  }
  if (type === "bmp") {
    return "bmp";
  }
  return undefined;
}

function convertTextBoxToPub(itemBox: DailyJournalDocumentItemBox): TextBoxProps {
  if (itemBox.item.type !== "textBox") {
    throw new Error("Expected itemBox.item.type to be 'textBox'");
  }

  const itemBoxStyle = convertToCssOrPdfProperties(itemBox.style) ?? {};
  const itemStyle = convertToCssOrPdfProperties(itemBox.item.data.style) ?? {};

  let fontWeight: "bold" | undefined;

  const nodeStyles: Array<{ nodeType: "text" | "root" | "paragraph"; style: CssOrPdfProperties }> = [];
  pushNodeStylesRecursive(nodeStyles, itemBox.item.data.richText);
  if (nodeStyles.length > 0) {
    if (nodeStyles.filter((x) => x.nodeType === "text").every((x) => x.style.fontWeight === "bold")) {
      fontWeight = "bold";
    }
  }

  const result: TextBoxProps = {
    text: serializeTextBoxData(itemBox.item.data),
    x: itemBoxStyle.left ?? "0",
    y: itemBoxStyle.top ?? "0",
    width: itemBoxStyle.width ?? "0",
    height: itemBoxStyle.height ?? "0",
    //fontFamily: itemBoxStyle.fontFamily ?? itemStyle.fontFamily ?? "Helvetica",
    fontSize: convertLengthValueToPtOrUndefined(itemBoxStyle.fontSize ?? itemStyle.fontSize) ?? 14,
    color: itemBoxStyle.color ?? itemStyle.color,
    textAlign: itemBoxStyle.textAlign ?? itemStyle.textAlign,
    fontWeight,
    border:
      itemBoxStyle.borderColor && itemBoxStyle.borderWidth
        ? {
            color: itemBoxStyle.borderColor,
            width: itemBoxStyle.borderWidth,
            style: itemBoxStyle.borderStyle ?? "solid",
          }
        : undefined,
  };
  return result;
}

function serializeTextBoxData(data: DailyJournalTextBoxItem["data"]): string {
  if (data?.text) {
    return data.text;
  }
  if (!data?.richText) {
    return "";
  }

  return serializeRichTextRootNode(data.richText);
}

function serializeRichTextRootNode(node: RichTextRootNode): string {
  return node.children.map((childNode) => serializeRichTextNode(childNode)).join("\n\n");
}

function serializeRichTextNode(node: RichTextNode): string {
  if (node.type === "text") {
    return node.text;
  }
  return node.children.map((childNode) => serializeRichTextNode(childNode)).join("\n\n");
}

function pushNodeStylesRecursive(
  nodeStyles: Array<{ nodeType: "text" | "root" | "paragraph"; style: CssOrPdfProperties }>,
  node: RichTextNode | undefined,
) {
  if (!node) return;

  const style = convertToCssOrPdfProperties(node.style) ?? {};
  if (node.type === "text" || node.type === "root" || node.type === "paragraph") {
    nodeStyles.push({ nodeType: node.type, style });
  }

  if (node.children) {
    for (const childNode of node.children) {
      pushNodeStylesRecursive(nodeStyles, childNode);
    }
  }
}

function convertLengthValueToPtOrUndefined(value: unknown | undefined): number | undefined {
  if (value === 0 || value === "0") {
    return 0;
  }

  if (typeof value !== "string") {
    return undefined;
  }

  const match = value.trim().match(/^([+-]?[0-9.]+)(pt|in|cm|mm)?$/i);
  if (!match) {
    return undefined;
  }

  const valueNum = match[1].includes(".") ? parseFloat(match[1]) : parseInt(match[1], 10);
  const unit = match[2]?.toLowerCase() ?? "";
  let pt: number | undefined;
  switch (unit) {
    case "pt":
      pt = valueNum;
      break;
    case "in":
      pt = 72 * valueNum;
      break;
    case "cm":
      pt = 72 * (valueNum / 2.54);
      break;
    case "mm":
      pt = 72 * (valueNum / 25.4);
      break;
  }
  return pt;
}

function convertBlobToBase64(blob: Blob | File): Promise<string> {
  const reader = new FileReader();
  reader.readAsDataURL(blob);
  return new Promise((resolve, reject) => {
    reader.onloadend = () => {
      const dataUrl = reader.result;
      if (typeof dataUrl !== "string") {
        reject("Failed to convert to Base64 string");
        return;
      }
      const base64 = dataUrl.split(",")[1];
      resolve(base64);
    };
  });
}
