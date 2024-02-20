import type { InitialEditorStateType } from "@lexical/react/LexicalComposer";
import type {
  SerializedEditorState,
  SerializedElementNode,
  SerializedLexicalNode,
  SerializedParagraphNode,
  SerializedRootNode,
  SerializedTextNode,
} from "lexical";
import type { CssOrPdfProperties } from "./CssOrPdfProperties";
import { convertToCssOrPdfProperties } from "./CssOrPdfProperties";
import {
  convertLengthValueToInchesStringOrUndefined,
  convertLengthValueToPtOrUndefined,
  convertLengthValueToPxOrUndefined,
} from "./LengthValue";
import type { SerializedLayoutContainerNode } from "./rich-text-editor/nodes/LayoutContainerNode";
import type { SerializedLayoutItemNode } from "./rich-text-editor/nodes/LayoutItemNode";

export interface TextBoxData {
  /**
   * The style of the box.
   */
  style?: TextBoxStyle;

  /**
   * The rich text contents of this textbox (if any).
   */
  richText?: RichTextRootNode;

  /**
   * The plain text contents of this textbox (if any).
   */
  text?: string;
}

export interface TextBoxStyle
  extends Pick<
    React.CSSProperties,
    | "backgroundColor"
    | "borderColor"
    | "borderRadius"
    | "borderStyle"
    | "borderWidth"
    | "color"
    | "fontFamily"
    | "fontSize"
    | "minHeight"
    | "paddingBottom"
    | "paddingLeft"
    | "paddingRight"
    | "paddingTop"
    | "width"
  > {
  borderStyle?: "dashed" | "dotted" | "solid";
  width?: number;
  minHeight?: number;
  fontSize?: `${number}pt`;
}

export interface RichTextElementNodeStyle extends Pick<React.CSSProperties, "textAlign"> {
  textAlign?: "left" | "right" | "center";
}

export interface RichTextTextNodeStyle
  extends Pick<React.CSSProperties, "fontWeight" | "fontStyle" | "textDecoration"> {
  fontWeight?: "bold";
  fontStyle?: "italic";
  textDecoration?: "underline";
}

export type RichTextNode = RichTextTextNode | RichTextElementNode;
// & {
//   type: "root" | "paragraph" | "layoutContainer" | "layoutItem" | "text";
//   text?: string;
//   children?: RichTextNode[];
// };

export interface RichTextElementNode {
  type: "root" | "paragraph" | "layoutContainer" | "layoutItem";
  style?: RichTextElementNodeStyle;
  children: RichTextNode[];
  //parent: RichTextElementNode | undefined;
  text?: undefined;
}

export interface RichTextNonRootElementNode extends RichTextElementNode {
  type: "paragraph" | "layoutContainer" | "layoutItem";
  //parent: RichTextElementNode | undefined;
}

export interface RichTextRootNode extends RichTextElementNode {
  type: "root";
  //parent: undefined;
}

export interface RichTextTextNode {
  type: "text";
  text: string;
  style?: RichTextTextNodeStyle;
  children?: undefined;
  //parent: RichTextElementNode | undefined;
}

//#region Lexical Convert

export function convertLexicalEditorStateToTextBoxData(lexicalEditorState: SerializedEditorState): TextBoxData {
  const textBoxData: TextBoxData = {};
  const richTextData = convertLexicalRootNodeToRichTextData(lexicalEditorState.root);
  if (richTextData) {
    textBoxData.richText = richTextData;

    if (richTextData.children.length === 1) {
      let singleChild = richTextData.children[0];
      if (singleChild.type === "paragraph" && !singleChild.style && singleChild.children.length === 1) {
        singleChild = singleChild.children[0];
      }
      if (singleChild.type === "text") {
        textBoxData.text = singleChild.text;
        textBoxData.richText = undefined;
      }
    }
  }
  return textBoxData;
}

export function convertLexicalRootNodeToRichTextData(lexicalRootNode: SerializedRootNode): TextBoxData["richText"] {
  console.log("lexicalRootNode", lexicalRootNode);
  const richTextNode = convertLexicalNodeToRichTextNode(lexicalRootNode);
  return richTextNode as RichTextRootNode;
}

function convertLexicalNodeToRichTextNode(
  lexicalNode: SerializedLexicalNode | undefined,
  //parent: RichTextElementNode | undefined,
): RichTextNode | undefined {
  if (!lexicalNode) {
    return undefined;
  }

  if (isTextNode(lexicalNode)) {
    const text = lexicalNode.text;
    const node: RichTextTextNode = {
      type: "text",
      text,
      //parent,
    };
    if (lexicalNode.format) {
      const style: RichTextTextNodeStyle = {};
      if (hasTextFormatType(lexicalNode.format, "bold")) {
        style.fontWeight = "bold";
      }
      if (hasTextFormatType(lexicalNode.format, "italic")) {
        style.fontStyle = "italic";
      }
      if (hasTextFormatType(lexicalNode.format, "underline")) {
        style.textDecoration = "underline";
      }
      node.style = style;
    }
    return node;
  }

  if (isElementNode(lexicalNode)) {
    let nodeType: RichTextElementNode["type"];
    const style: RichTextElementNodeStyle = {};
    if (isParagraphNode(lexicalNode)) {
      nodeType = "paragraph";
    } else if (isRootNode(lexicalNode)) {
      nodeType = "root";
    } else if (isLayoutContainerNode(lexicalNode)) {
      nodeType = "layoutContainer";
      //style.gridTemplateColumns = (lexicalNode as SerializedLayoutContainerNode).templateColumns;
    } else if (isLayoutItemNode(lexicalNode)) {
      nodeType = "layoutItem";
    } else {
      return undefined;
    }

    if (!lexicalNode.format || lexicalNode.format === "left") {
      style.textAlign = "left";
    } else if (lexicalNode.format === "right") {
      style.textAlign = "right";
    } else if (lexicalNode.format === "center") {
      style.textAlign = "center";
    }

    const node: RichTextElementNode = {
      type: nodeType,
      children: [],
      //parent,
      style,
    };
    for (const childLexicalNode of lexicalNode.children) {
      const childNode = convertLexicalNodeToRichTextNode(childLexicalNode);
      if (!childNode) {
        continue;
      }
      node.children.push(childNode);
    }
    return node;
  }

  return undefined;
}

export function convertTextBoxDataToLexicalInitialEditorState(
  textBoxData: TextBoxData | undefined,
): InitialEditorStateType {
  if (!textBoxData) {
    return null;
  }

  let lexicalRootNode: SerializedRootNode | undefined;
  if (textBoxData.richText) {
    lexicalRootNode = convertRichTextDataToLexicalRootNode(textBoxData.richText);
  } else if (textBoxData.text) {
    lexicalRootNode = createRootNode();
    const lexicalParagraphNode = createParagraphNode();
    lexicalRootNode.children.push(lexicalParagraphNode);
    const lexicalTextNode = createTextNode(textBoxData.text);
    lexicalParagraphNode.children.push(lexicalTextNode);
  }

  if (lexicalRootNode) {
    const initialEditorState = JSON.stringify({ root: lexicalRootNode });
    console.log("textBoxData", textBoxData);
    console.log("initialEditorState", initialEditorState);
    return initialEditorState;
  }
  return null;
}

function convertRichTextDataToLexicalRootNode(richTextData: TextBoxData["richText"]): SerializedRootNode | undefined {
  const lexicalRootNode = convertRichTextNodeToLexicalNode(richTextData) as SerializedRootNode;
  return lexicalRootNode;
}

function convertRichTextNodeToLexicalNode(node: RichTextNode | undefined): SerializedLexicalNode | undefined {
  if (!node) {
    return undefined;
  }

  if (node.type === "text") {
    const lexicalTextNode = createTextNode(node.text);
    if (node.style) {
      if (node.style.fontWeight === "bold") {
        lexicalTextNode.format = toggleTextFormatType(lexicalTextNode.format ?? 0, "bold");
      }
      if (node.style.fontStyle === "italic") {
        lexicalTextNode.format = toggleTextFormatType(lexicalTextNode.format ?? 0, "italic");
      }
      if (node.style.textDecoration === "underline") {
        lexicalTextNode.format = toggleTextFormatType(lexicalTextNode.format ?? 0, "underline");
      }
    }
    return lexicalTextNode;
  }

  let lexicalNode: SerializedElementNode;
  if (node.type === "root") {
    lexicalNode = createRootNode();
  } else if (node.type === "paragraph") {
    lexicalNode = createParagraphNode();
  } else if (node.type === "layoutContainer") {
    const templateColumns = node.children.map((_) => "1fr").join(" ");
    lexicalNode = createLayoutContainerNode(templateColumns);
    //console.log("lexicalNode type=layoutContainer", templateColumns, lexicalNode);
  } else if (node.type === "layoutItem") {
    lexicalNode = createLayoutItemNode();
  } else {
    return undefined;
  }

  if (node.style?.textAlign) {
    //console.log("set textAlign", node, node.style.textAlign, lexicalNode.format);
    //'left' | 'start' | 'center' | 'right' | 'end' | 'justify' | ''
    lexicalNode.format = node.style.textAlign;
  }

  const children: SerializedLexicalNode[] = [];
  for (const childNode of node.children) {
    const childLexicalNode = convertRichTextNodeToLexicalNode(childNode);
    if (!childLexicalNode) {
      continue;
    }
    children.push(childLexicalNode);
  }
  //lexicalNode.append(...children);
  lexicalNode.children = children;

  return lexicalNode;
}

function createRootNode(): SerializedRootNode {
  return { type: "root", version: 1, format: "", indent: 0, direction: null, children: [] };
}

function isRootNode(node: SerializedLexicalNode): node is SerializedRootNode {
  return node.type === "root";
}

function createParagraphNode(): SerializedParagraphNode {
  return { type: "paragraph", version: 1, format: "", indent: 0, direction: null, textFormat: 0, children: [] };
}

function isParagraphNode(node: SerializedLexicalNode): node is SerializedParagraphNode {
  return node.type === "paragraph";
}

function createTextNode(text: string): SerializedTextNode {
  return { type: "text", version: 1, text, format: 0, style: "", mode: "normal", detail: 0 };
}

function isTextNode(node: SerializedLexicalNode): node is SerializedTextNode {
  return node.type === "text";
}

function createLayoutContainerNode(templateColumns: string): SerializedLayoutContainerNode {
  return {
    type: "layout-container",
    templateColumns,
    version: 1,
    format: "",
    indent: 0,
    direction: null,
    children: [],
  };
}

function isLayoutContainerNode(node: SerializedLexicalNode): node is SerializedLayoutContainerNode {
  return node.type === "layout-container";
}

function createLayoutItemNode(): SerializedLayoutItemNode {
  return { type: "layout-item", version: 1, format: "", indent: 0, direction: null, children: [] };
}

function isLayoutItemNode(node: SerializedLexicalNode): node is SerializedLayoutItemNode {
  return node.type === "layout-item";
}

function isElementNode(node: SerializedLexicalNode): node is SerializedElementNode {
  return "children" in node;
}

const TEXT_TYPE_TO_FORMAT = {
  bold: 1,
  italic: 2,
  underline: 8,
} as const;

function hasTextFormatType(format: number, type: "bold" | "italic" | "underline"): boolean {
  const formatFlag = TEXT_TYPE_TO_FORMAT[type];
  return (format & formatFlag) !== 0;
}

function toggleTextFormatType(
  format: number,
  type: "bold" | "italic" | "underline",
  alignWithFormat: number | null = null,
): number {
  const activeFormat = TEXT_TYPE_TO_FORMAT[type];
  if (alignWithFormat !== null && (format & activeFormat) === (alignWithFormat & activeFormat)) {
    return format;
  }
  const newFormat = format ^ activeFormat;
  return newFormat;
}

//#endregion

//#region Font Size

export function calculateTextBoxDataWidthPx(data: TextBoxData): number {
  let width = convertLengthValueToPxOrUndefined(data.style?.width);
  if (!width) {
    return 0;
  }
  // if (!data.style) {
  //   return width;
  // }

  // if (data.style.paddingLeft) {
  //   width += convertLengthValueToPxOrUndefined(data.style.paddingLeft) ?? 0;
  // }
  // if (data.style.paddingRight) {
  //   width += convertLengthValueToPxOrUndefined(data.style.paddingRight) ?? 0;
  // }
  // if (data.style.borderStyle && data.style.borderWidth) {
  //   width += (convertLengthValueToPxOrUndefined(data.style.borderWidth) ?? 0) * 2;
  // }
  return width;
}

export function calculateTextBoxDataHeightPx(data: TextBoxData): number {
  const el = createTextBoxDataElement(data);
  el.style.display = "absolute";
  el.style.top = "0px";
  el.style.left = "calc(100vw * 2)";
  el.style.visibility = "hidden";
  el.style.minHeight = "";
  el.style.height = "";

  let height: number;
  try {
    document.body.append(el);
    height = el.offsetHeight;
    console.log("createTextBoxDataElement", el, height);
  } finally {
    el.remove();
  }
  return height;
}

export function calculateTextBoxDataScaledFontSizePtString(
  data: TextBoxData,
  targetWidth: number,
  targetHeight: number,
): `${number}pt` | undefined {
  const el = createTextBoxDataElement(data);
  el.style.position = "absolute";
  el.style.top = "0px";
  el.style.left = "calc(100vw * 2)";
  el.style.visibility = "hidden";
  el.style.boxSizing = "border-box";

  let width = targetWidth;
  let height = targetHeight;

  // // Get rid of any padding/border and just use it to reduce the width/height.
  // // I think our overflow logic doesn't work if the text encroaches into the padding/border?
  // const textBoxStyle = convertToCssOrPdfProperties(data.style);
  // if (textBoxStyle) {
  //   if (textBoxStyle.paddingLeft) {
  //     width -= convertLengthValueToPxOrUndefined(textBoxStyle.paddingLeft) ?? 0;
  //     el.style.paddingLeft = "0";
  //   }
  //   if (textBoxStyle.paddingRight) {
  //     width -= convertLengthValueToPxOrUndefined(textBoxStyle.paddingRight) ?? 0;
  //     el.style.paddingRight = "0";
  //   }
  //   if (textBoxStyle.paddingTop) {
  //     height -= convertLengthValueToPxOrUndefined(textBoxStyle.paddingTop) ?? 0;
  //     el.style.paddingTop = "0";
  //   }
  //   if (textBoxStyle.paddingBottom) {
  //     height -= convertLengthValueToPxOrUndefined(textBoxStyle.paddingBottom) ?? 0;
  //     el.style.paddingBottom = "0";
  //   }
  //   if (textBoxStyle.borderStyle && textBoxStyle.borderWidth) {
  //     width -= (convertLengthValueToPxOrUndefined(textBoxStyle.borderWidth) ?? 0) * 2;
  //     height -= (convertLengthValueToPxOrUndefined(textBoxStyle.borderWidth) ?? 0) * 2;
  //     el.style.borderWidth = "0";
  //   }
  // }

  el.style.width = convertLengthValueToInchesStringOrUndefined(width) ?? "0";
  el.style.height = convertLengthValueToInchesStringOrUndefined(height) ?? "0";

  let fontSizePt = convertLengthValueToPtOrUndefined(data.style?.fontSize) ?? 12;
  el.style.fontSize = `${fontSizePt}pt`;
  try {
    document.body.append(el);
    console.log("fontSizePt", fontSizePt, el, el.clientHeight, el.scrollHeight);
    const minFontSizePt = 6;
    while (fontSizePt > minFontSizePt && isOverflow(el)) {
      //fontSizePt = chooseNextFontSize(fontSizePt, minFontSizePt);
      fontSizePt--;
      el.style.fontSize = `${fontSizePt}pt`;
      console.log("nextFontSizePt", fontSizePt);
    }
    return `${fontSizePt}pt`;
  } finally {
    el.remove();
  }
}

// function chooseNextFontSize(fontSize: number, minFontSize: number): number {
//   const fontSizeRange = fontSize - minFontSize;
//   if (fontSizeRange <= 1) {
//     return minFontSize;
//   }

//   if (fontSizeRange >= 10) {
//     return fontSizeRange / 2 + minFontSize;
//   }

//   return fontSize - 1;
// }

function isOverflow(element: HTMLElement) {
  return element.scrollHeight > element.clientHeight || element.scrollWidth > element.clientWidth;
}

function createTextBoxDataElement(data: TextBoxData): HTMLDivElement {
  const divElement = document.createElement("div");
  applyStyle(divElement, data.style);

  if (data.richText) {
    divElement.append(createRichTextNodeElement(data.richText));
  } else if (data.text) {
    divElement.textContent = data.text;
  }
  return divElement;
}

function createRichTextNodeElement(node: RichTextNode): HTMLElement {
  if (node.type === "text") {
    const spanElement = document.createElement("span");
    if (node.style) {
      applyStyle(spanElement, node.style);
    }
    if (node.text) {
      spanElement.innerText = node.text;
    }
    return spanElement;
  }

  let containerElement: HTMLElement;
  if (node.type === "paragraph") {
    containerElement = document.createElement("p");
  } else {
    containerElement = document.createElement("div");
    if (node.type === "layoutContainer") {
      containerElement.style.display = "flex";
      containerElement.style.justifyContent = "space-between";
      containerElement.style.alignItems = "center";
    } else if (node.type === "layoutItem") {
      containerElement.style.flexGrow = "1";
    }
  }
  if (node.style) {
    applyStyle(containerElement, node.style);
  }

  const childElements = node.children.map((childNode) => createRichTextNodeElement(childNode));
  containerElement.append(...childElements);
  return containerElement;
}

function applyStyle(element: HTMLElement, style: React.CSSProperties | CssOrPdfProperties | undefined) {
  if (!style) {
    return;
  }

  // let modifiedStyle: CssOrPdfProperties | undefined;
  // if (style.minHeight || style.height) {
  //   let modifiedStyle = { ...style };
  //   if (modifiedStyle.minHeight) {
  //     delete modifiedStyle.minHeight;
  //   }
  //   if (modifiedStyle.height) {
  //     delete modifiedStyle.height;
  //   }
  // }

  Object.assign(element.style, convertToCssOrPdfProperties(style));
}

//#endregion
