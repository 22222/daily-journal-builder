import type { ParagraphChild, FileChild, IBorderOptions } from "docx";
import {
  AlignmentType,
  BorderStyle,
  CharacterSet,
  Document,
  FrameAnchorType,
  ImageRun,
  Packer,
  Paragraph,
  Table,
  TableCell,
  TableRow,
  TextRun,
  Textbox,
} from "docx";

import { CssOrPdfProperties, convertToCssOrPdfProperties } from "./CssOrPdfProperties";
import type { DailyJournalDocument, DailyJournalDocumentContext } from "./DailyJournalDocument";
import type { LengthValue } from "./LengthValue";
// import {
//   convertLengthValueToPtOrUndefined,
//   convertLengthValueToPt,
//   convertLengthValueToInchesString,
//   convertLengthValueToEmuOrUndefined,
//   convertLengthValueToEmu,
//   convertLengthValueToPx,
// } from "./LengthValue";
import type { RichTextElementNode, RichTextNode, RichTextRootNode, TextBoxData } from "./TextBoxData";

declare type FontOptions = {
  readonly name: string;
  readonly data: Buffer;
  readonly characterSet?: (typeof CharacterSet)[keyof typeof CharacterSet];
};

export async function generateDocxBlob(
  document: DailyJournalDocument,
  context: DailyJournalDocumentContext,
): Promise<Blob> {
  const rootParagraphChildren: ParagraphChild[] = [];
  const rootSectionChildren: FileChild[] = [];
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

      const imageArrayBuffer = await imageData.arrayBuffer();

      const imageRun = new ImageRun({
        type: imageType,
        data: imageArrayBuffer,
        transformation: {
          width: convertLengthValueToPx(itemBox.style.width),
          height: convertLengthValueToPx(itemBox.style.height),
        },
        floating: {
          zIndex: 10,
          horizontalPosition: {
            offset: convertLengthValueToEmu(itemBox.style.left),
          },
          verticalPosition: {
            offset: convertLengthValueToEmu(itemBox.style.top),
          },
        },
      });
      rootParagraphChildren.push(imageRun);
    }
    if (itemBox.item.type === "textBox") {
      const textBox = createTextBox(itemBox.item.data, itemBox.style, itemBox.style.fontSize, context);

      rootSectionChildren.push(textBox);
    }
  }

  const rootParagraph = new Paragraph({ children: rootParagraphChildren });
  const docxDocument = new Document({
    sections: [
      {
        properties: {
          page: {
            size: {
              width: convertLengthUnit(document.style.width),
              height: convertLengthUnit(document.style.height),
              orientation: "portrait",
            },
            margin: {
              left: ".25in",
              top: ".25in",
              right: ".25in",
              bottom: ".25in",
            },
          },
        },
        children: [rootParagraph, ...rootSectionChildren],
      },
    ],
  });
  return Packer.toBlob(docxDocument, true);
}

function createTextBox(
  data: TextBoxData,
  styleOverride: CssOrPdfProperties | undefined,
  fontSizeOverride: `${number}pt` | undefined,
  context: DailyJournalDocumentContext,
) {
  const { width, height, minHeight, fontSize, ...otherStyle } = {
    ...(convertToCssOrPdfProperties(data.style) ?? {}),
    ...styleOverride,
  };
  const style = {
    ...otherStyle,
    fontSize: fontSizeOverride ?? fontSize,
    //overflow: "hidden",
    //textOverflow: "ellipsis",
    ...styleOverride,
  };

  let parentWidthInches = convertLengthValueToInches(width);
  if (otherStyle.marginLeft) {
    parentWidthInches -= convertLengthValueToInches(otherStyle.marginLeft);
  }
  if (otherStyle.marginRight) {
    parentWidthInches -= convertLengthValueToInches(otherStyle.marginRight);
  }
  if (otherStyle.paddingLeft) {
    parentWidthInches -= convertLengthValueToInches(otherStyle.paddingLeft);
  }
  if (otherStyle.paddingRight) {
    parentWidthInches -= convertLengthValueToInches(otherStyle.paddingRight);
  }

  let parentHeightInches = convertLengthValueToInches(height);
  if (otherStyle.marginTop) {
    parentHeightInches -= convertLengthValueToInches(otherStyle.marginTop);
  }
  if (otherStyle.marginBottom) {
    parentHeightInches -= convertLengthValueToInches(otherStyle.marginBottom);
  }
  if (otherStyle.paddingTop) {
    parentHeightInches -= convertLengthValueToInches(otherStyle.paddingTop);
  }
  if (otherStyle.paddingBottom) {
    parentHeightInches -= convertLengthValueToInches(otherStyle.paddingBottom);
  }

  if (otherStyle.borderWidth) {
    parentWidthInches -= convertLengthValueToInches(otherStyle.borderWidth) * 2;
    parentHeightInches -= convertLengthValueToInches(otherStyle.borderWidth) * 2;
  }

  const parentWidth: LengthValue = `${parentWidthInches}in`;
  const parentHeight: LengthValue = `${parentHeightInches}in`;

  const borderStyle: IBorderOptions | undefined =
    style.borderWidth && style.borderWidth
      ? {
          color: convertColorOrUndefined(style.borderColor) ?? "auto",
          space: 1,
          style: convertBorderStyleOrUndefined(style.borderStyle) ?? BorderStyle.NONE,
          size: convertLengthValueToEighthPt(style.borderWidth),
        }
      : undefined;
  // : {
  //     color: "auto",
  //     space: undefined,
  //     style: BorderStyle.NONE,
  //     size: 0,
  //   };

  const richTextNodeContext: RichTextNodeContext = {
    //registeredFontMap,
    parent: undefined,
    parentWidth,
    parentHeight,
    fontFamily: Array.isArray(style?.fontFamily) ? style.fontFamily[0] : style?.fontFamily,
    fontSize: fontSizeOverride ?? style?.fontSize,
    fontWeight: style?.fontWeight,
    fontStyle: style?.fontStyle,
  };

  const textbox = new Textbox({
    // frame: {
    //   type: "absolute",
    //   position: {
    //     x: convertLengthValueToDxa(style.left ?? 0),
    //     y: convertLengthValueToDxa(style.top ?? 0),
    //   },
    //   width: parentWidth,
    //   height: parentHeight,
    //   anchor: {
    //     horizontal: FrameAnchorType.MARGIN,
    //     vertical: FrameAnchorType.MARGIN,
    //   },
    // },
    style: {
      //convertLengthUnit
      width: convertLengthValueToPtString(parentWidth),
      height: convertLengthValueToPtString(parentHeight),
      position: "absolute",
      marginLeft: convertLengthValueToPtString(style.left ?? 0),
      marginTop: convertLengthValueToPtString(style.top ?? 0),
      zIndex: 100,
      positionHorizontal: "center",
      positionHorizontalRelative: "text",
      positionVertical: "absolute",
      positionVerticalRelative: "text",
    },
    border: borderStyle
      ? {
          top: borderStyle,
          bottom: borderStyle,
          left: borderStyle,
          right: borderStyle,
        }
      : undefined,
    children: data.richText ? convertRichTextRootNode(data.richText, richTextNodeContext) : [],
  });
  return textbox;
}

interface RichTextNodeContext {
  //registeredFontMap: Map<string, FontFace[]>;
  parent: RichTextElementNode | undefined;
  parentWidth: LengthValue | undefined;
  parentHeight: LengthValue | undefined;
  fontFamily: string | undefined;
  fontSize: `${number}pt` | undefined;
  fontWeight: CssOrPdfProperties["fontWeight"] | undefined;
  fontStyle: CssOrPdfProperties["fontStyle"] | undefined;
}

function convertRichTextRootNode(node: RichTextRootNode, context: RichTextNodeContext): ParagraphChild[] {
  const children = node.children.map((childNode) => convertRichTextNode(childNode, context));
  return children;
}

function convertRichTextNode(node: RichTextNode, context: RichTextNodeContext): ParagraphChild {
  if (node.type === "text") {
    const textRun = new TextRun({
      text: node.text,
      bold: (node.style?.fontWeight ?? context.fontWeight) === "bold",
      italics: (node.style?.fontStyle ?? context.fontStyle) === "italic",
      underline: node.style?.textDecoration === "underline" ? { type: "single" } : undefined,
      //size: context.fontSize,
      size: context.fontSize ? convertLengthValueToHalfPt(context.fontSize) : 28,
    });
    return textRun;
  }

  let width = context.parentWidth;
  let style = convertToCssOrPdfProperties(node.style);
  const childContext: RichTextNodeContext = {
    ...context,
    parent: node,
    parentWidth: width,
    fontFamily: style?.fontFamily ?? context.fontFamily,
    fontSize: style?.fontSize ?? context.fontSize,
    fontWeight: style?.fontWeight ?? context.fontWeight,
    fontStyle: style?.fontStyle ?? context.fontStyle,
  };
  const children = node.children.map((childNode) => convertRichTextNode(childNode, childContext));

  if (node.type === "layoutContainer") {
    const tableCells = children.filter((x) => x instanceof TableCell);
    const row = new TableRow({ children: tableCells });
    const tbl = new Table({
      rows: [row],
      borders: {
        top: { style: "none", size: 0, space: 0, color: "auto" },
        left: { style: "none", size: 0, space: 0, color: "auto" },
        bottom: { style: "none", size: 0, space: 0, color: "auto" },
        right: { style: "none", size: 0, space: 0, color: "auto" },
      },
      //width: { size: convertLengthValueToDxaOrUndefined(width) ?? 0, type: "dxa" },
      width: { size: "100%", type: "pct" },
    });
    return tbl;
  }

  if (node.type === "layoutItem") {
    const paragraphChildren = children.filter((x) => x instanceof Paragraph);
    const cell = new TableCell({
      width: { size: "50%", type: "pct" },
      children: paragraphChildren,
    });
    return cell;
  }

  if (node.type === "paragraph") {
    const p = new Paragraph({
      children,
      alignment: convertTextAlignOrUndefined(node.style?.textAlign),
      style: "Normal",
    });
    return p;
  }

  //console.log("Unrecognized node type", node.type, node);

  return children[0];
}

// From https://startbigthinksmall.wordpress.com/2010/01/04/points-inches-and-emus-measuring-units-in-office-open-xml/:
//
// > The main unit in OOXML is a twentieth of a point. This is used for specifying page dimensions, margins, tabs, etc
//
// > Half-points are used to specify font sizes. A font-size of 12pt equals 24 half points
//
// > Fiftieths of a Percent is used for relative measurements in some places. It can for example be used for specifying tables total with, cell with and margins.
//
// > EMUs are used for coordinates in vector-based drawings and embedded pictures. The EMU is a virtual unit to bridge both centimeters and inches.
// > One inch equates to 914400 EMUs and a centimeter is 360000.
// > Actually I found out that the number 914400 is calculated by (the least common multiple of 100 and 254) times 72.
// > As I understand it, this ensures that you can convert forth and back between integer 100th inches, millimeters and pixels with out any floating points.

function convertTextAlignOrUndefined(
  value: CssOrPdfProperties["textAlign"] | undefined,
): (typeof AlignmentType)[keyof typeof AlignmentType] | undefined {
  if (value === "left") {
    return AlignmentType.LEFT;
  }
  if (value === "right") {
    return AlignmentType.RIGHT;
  }
  if (value === "center") {
    return AlignmentType.CENTER;
  }
  return undefined;
}

function convertBorderStyleOrUndefined(
  value: CssOrPdfProperties["borderStyle"] | undefined,
): (typeof BorderStyle)[keyof typeof BorderStyle] | undefined {
  if (value === "solid") {
    return BorderStyle.SINGLE;
  }
  if (value === "dotted") {
    return BorderStyle.DOTTED;
  }
  if (value === "dashed") {
    return BorderStyle.DASHED;
  }
  return undefined;
}

function convertColorOrUndefined(value: `#${string}` | undefined): string | undefined {
  if (typeof value === "string" && value.startsWith("#")) {
    return value.substring(1);
  }
  return undefined;
}

function convertImageTypeOrUndefined(typeOrName: string | undefined): "jpg" | "png" | "gif" | "bmp" | undefined {
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
    return "jpg";
  }
  if (type === "png") {
    return "png";
  }
  if (type === "gif") {
    return "gif";
  }
  if (type === "bmp") {
    return "bmp";
  }
  return undefined;
}

function convertLengthUnit(size: `${number}in` | "0" | 0): `${number}in` | 0 {
  if (size === "0") {
    return 0;
  }
  return size;
}

function convertLengthValueToPx(value: DocumentLengthValue): number {
  const result = convertLengthValueToPxOrUndefined(value);
  if (typeof result !== "number") {
    throw new Error("Missing required length value");
  }
  return result;
}

export function convertLengthValueToPxOrUndefined(value: DocumentLengthValue | undefined): number | undefined {
  const emu = convertLengthValueToEmuOrUndefined(value);
  if (typeof emu !== "number") {
    return undefined;
  }

  // Based on the docx.js library's image-run.ts:
  //
  // > pixels: {
  // >   x: Math.round(options.transformation.width),
  // >   y: Math.round(options.transformation.height),
  // > },
  // > emus: {
  // >   x: Math.round(options.transformation.width * 9525),
  // >   y: Math.round(options.transformation.height * 9525),
  // > },
  // ```
  return emu / 9525;
}

function convertLengthValueToEmu(value: DocumentLengthValue): number {
  const result = convertLengthValueToEmuOrUndefined(value);
  if (typeof result !== "number") {
    throw new Error("Missing required length value");
  }
  return result;
}

function convertLengthValueToEmuOrUndefined(value: DocumentLengthValue | undefined): number | undefined {
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
  let emu: number | undefined;
  switch (unit) {
    case "pt":
      emu = (valueNum / 72) * 914400;
      break;
    case "in":
      emu = valueNum * 914400;
      break;
    case "cm":
      emu = (valueNum / 2.54) * 914400;
      break;
    case "mm":
      emu = (valueNum / 25.4) * 914400;
      break;
  }
  return emu;
}

function convertLengthValueToDxa(value: DocumentLengthValue): number {
  const result = convertLengthValueToDxaOrUndefined(value);
  if (typeof result !== "number") {
    throw new Error("Missing required length value");
  }
  return result;
}

function convertLengthValueToDxaOrUndefined(value: DocumentLengthValue | unknown | undefined): number | undefined {
  const pt = convertLengthValueToPtOrUndefined(value);
  if (typeof pt !== "number") {
    return undefined;
  }
  return (pt * 20) | 0;
}

function convertLengthValueToEighthPt(value: DocumentLengthValue): number {
  const result = convertLengthValueToEighthPtOrUndefined(value);
  if (typeof result !== "number") {
    throw new Error("Missing required length value");
  }
  return result;
}

function convertLengthValueToEighthPtOrUndefined(value: DocumentLengthValue | undefined): number | undefined {
  const pt = convertLengthValueToPtOrUndefined(value);
  if (typeof pt !== "number") {
    return undefined;
  }
  return (pt * 8) | 0;
}

function convertLengthValueToHalfPt(value: DocumentLengthValue): number {
  const result = convertLengthValueToHalfPtOrUndefined(value);
  if (typeof result !== "number") {
    throw new Error("Missing required length value");
  }
  return result;
}

function convertLengthValueToHalfPtOrUndefined(value: DocumentLengthValue | undefined): number | undefined {
  const pt = convertLengthValueToPtOrUndefined(value);
  if (typeof pt !== "number") {
    return undefined;
  }
  return (pt * 2) | 0;
}

function convertLengthValueToPtString(value: DocumentLengthValue): `${number}pt` {
  const pt = convertLengthValueToPt(value);
  const ptString: `${number}pt` = `${pt}pt`;
  return ptString;
}

function convertLengthValueToPt(value: DocumentLengthValue): number {
  const result = convertLengthValueToPtOrUndefined(value);
  if (typeof result !== "number") {
    throw new Error("Missing required length value");
  }
  return result;
}

function convertLengthValueToPtOrUndefined(value: DocumentLengthValue | unknown | undefined): number | undefined {
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

function convertLengthValueToInches(value: `${number}in` | "0" | 0 | undefined): number {
  return convertLengthValueToInchesOrUndefined(value) ?? 0;
}

function convertLengthValueToInchesOrUndefined(value: `${number}in` | "0" | 0 | undefined): number | undefined {
  if (value === 0 || value === "0") {
    return 0;
  }

  if (typeof value !== "string") {
    return undefined;
  }

  const match = value.trim().match(/^([+-]?[0-9.]+)(in)?$/i);
  if (!match) {
    return undefined;
  }

  const valueNum = match[1].includes(".") ? parseFloat(match[1]) : parseInt(match[1], 10);
  const unit = match[2]?.toLowerCase() ?? "";
  let inches: number | undefined;
  switch (unit) {
    case "in":
      inches = valueNum;
      break;
  }
  return inches;
}

type DocumentLengthValue = `${number}pt` | `${number}in` | `${number}cm` | `${number}mm` | "0" | 0;
