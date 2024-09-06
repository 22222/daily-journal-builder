import type { Style as ReactPdfStyle } from "@react-pdf/types";
import { convertLengthValueToInchesStringOrUndefined, convertLengthValueToPtStringOrUndefined } from "./LengthValue";
import type { RichTextElementNodeStyle, RichTextTextNodeStyle, TextBoxStyle } from "./TextBoxData";

type CssOrPdfPropertyKeys =
  | "backgroundColor"
  | "borderColor"
  | "borderRadius"
  | "borderStyle"
  | "borderWidth"
  | "color"
  | "display"
  | "fontFamily"
  | "fontSize"
  | "fontStyle"
  | "fontWeight"
  | "height"
  | "left"
  | "marginBottom"
  | "marginLeft"
  | "marginRight"
  | "marginTop"
  | "minHeight"
  | "overflow"
  | "paddingBottom"
  | "paddingLeft"
  | "paddingRight"
  | "paddingTop"
  | "position"
  | "textAlign"
  | "textDecoration"
  | "top"
  | "width";

export interface CssOrPdfProperties
  extends Pick<React.CSSProperties, CssOrPdfPropertyKeys>,
    Pick<Partial<CSSStyleDeclaration>, CssOrPdfPropertyKeys>,
    Pick<ReactPdfStyle, CssOrPdfPropertyKeys> {
  alignItems?: "flex-start" | "flex-end" | "center";
  backgroundColor?: `#${string}`;
  borderColor?: `#${string}`;
  borderRadius?: `${number}in` | "0";
  borderStyle?: "dashed" | "dotted" | "solid";
  borderWidth?: `${number}in` | "0";
  color?: `#${string}`;
  display?: "flex";
  flexDirection?: "row";
  flexGrow?: 0 | 1;
  flexWrap?: "nowrap";
  fontFamily?: string;
  fontSize?: `${number}pt`;
  fontStyle?: "italic" | "normal";
  fontWeight?: "bold" | "normal";
  height?: `${number}in` | "0";
  justifyContent?: "space-between" | "flex-start" | "flex-end" | "center";
  left?: `${number}in` | "0";
  marginBottom?: `${number}in` | "0";
  marginLeft?: `${number}in` | "0";
  marginRight?: `${number}in` | "0";
  marginTop?: `${number}in` | "0";
  minHeight?: `${number}in` | "0";
  overflow?: "hidden";
  paddingBottom?: `${number}in` | "0";
  paddingLeft?: `${number}in` | "0";
  paddingRight?: `${number}in` | "0";
  paddingTop?: `${number}in` | "0";
  position?: "absolute" | "relative";
  textAlign?: "left" | "right" | "center";
  textDecoration?: "underline" | "none";
  top?: `${number}in` | "0";
  width?: `${number}in` | "0";
}

export function convertToCssOrPdfProperties(
  style:
    | TextBoxStyle
    | RichTextTextNodeStyle
    | RichTextElementNodeStyle
    | React.CSSProperties
    | CSSStyleDeclaration
    | ReactPdfStyle
    | undefined,
): CssOrPdfProperties | undefined {
  if (!style) {
    return undefined;
  }

  const result: CssOrPdfProperties = {};
  if ("alignItems" in style && isAlignItems(style.alignItems)) result.alignItems = style.alignItems;
  if ("backgroundColor" in style) result.backgroundColor = convertColorToHex(style.backgroundColor);
  if ("borderColor" in style) result.borderColor = convertColorToHex(style.borderColor);
  if ("borderRadius" in style) result.borderRadius = convertLengthValueToInchesStringOrUndefined(style.borderRadius);
  if ("borderStyle" in style && isBorderStyle(style.borderStyle)) result.borderStyle = style.borderStyle;
  if ("borderWidth" in style) result.borderWidth = convertLengthValueToInchesStringOrUndefined(style.borderWidth);
  if ("color" in style) result.color = convertColorToHex(style.color);
  if ("flexDirection" in style && isFlexDirection(style.flexDirection)) result.flexDirection = style.flexDirection;
  if ("flexGrow" in style && isFlexGrow(style.flexGrow)) result.flexGrow = style.flexGrow;
  if ("flexWrap" in style && isFlexWrap(style.flexWrap)) result.flexWrap = style.flexWrap;
  if ("fontFamily" in style) result.fontFamily = style.fontFamily;
  if ("fontSize" in style) result.fontSize = convertLengthValueToPtStringOrUndefined(style.fontSize);
  if ("fontStyle" in style && isFontStyle(style.fontStyle)) result.fontStyle = style.fontStyle;
  if ("fontWeight" in style && isFontWeight(style.fontWeight)) result.fontWeight = style.fontWeight;
  if ("height" in style) result.height = convertLengthValueToInchesStringOrUndefined(style.height);
  if ("justifyContent" in style && isJustifyContent(style.justifyContent)) result.justifyContent = style.justifyContent;
  if ("left" in style) result.left = convertLengthValueToInchesStringOrUndefined(style.left);
  if ("marginBottom" in style) result.marginBottom = convertLengthValueToInchesStringOrUndefined(style.marginBottom);
  if ("marginLeft" in style) result.marginLeft = convertLengthValueToInchesStringOrUndefined(style.marginLeft);
  if ("marginRight" in style) result.marginRight = convertLengthValueToInchesStringOrUndefined(style.marginRight);
  if ("marginTop" in style) result.marginTop = convertLengthValueToInchesStringOrUndefined(style.marginTop);
  if ("minHeight" in style) result.minHeight = convertLengthValueToInchesStringOrUndefined(style.minHeight);
  if ("overflow" in style && isOverflow(style.overflow)) result.overflow = style.overflow;
  if ("paddingBottom" in style) result.paddingBottom = convertLengthValueToInchesStringOrUndefined(style.paddingBottom);
  if ("paddingLeft" in style) result.paddingLeft = convertLengthValueToInchesStringOrUndefined(style.paddingLeft);
  if ("paddingRight" in style) result.paddingRight = convertLengthValueToInchesStringOrUndefined(style.paddingRight);
  if ("paddingTop" in style) result.paddingTop = convertLengthValueToInchesStringOrUndefined(style.paddingTop);
  if ("position" in style && isPosition(style.position)) result.position = style.position;
  if ("textAlign" in style && isTextAlign(style.textAlign)) result.textAlign = style.textAlign;
  if ("textDecoration" in style && isTextDecoration(style.textDecoration)) result.textDecoration = style.textDecoration;
  if ("top" in style) result.top = convertLengthValueToInchesStringOrUndefined(style.top);
  if ("width" in style) result.width = convertLengthValueToInchesStringOrUndefined(style.width);

  return result;
}

function isAlignItems(value: unknown): value is "flex-start" | "flex-end" | "center" {
  return value === "flex-start" || value === "flex-end" || value === "center";
}

function isBorderStyle(value: unknown): value is "dashed" | "dotted" | "solid" {
  return value === "dashed" || value === "dotted" || value === "solid";
}

function isFlexDirection(value: unknown): value is "row" {
  return value === "row";
}

function isFlexWrap(value: unknown): value is "nowrap" {
  return value === "nowrap";
}

function isFlexGrow(value: unknown): value is 0 | 1 {
  return value === 0 || value === 1;
}

function isFontStyle(value: unknown): value is "italic" | "normal" {
  return value === "italic" || value === "normal";
}

function isFontWeight(value: unknown): value is "bold" | "normal" {
  return value === "bold" || value === "normal";
}

function isJustifyContent(value: unknown): value is "space-between" | "flex-start" | "flex-end" | "center" {
  return value === "space-between" || value === "flex-start" || value === "flex-end" || value === "center";
}

function isOverflow(value: unknown): value is "hidden" {
  return value === "hidden";
}

function isPosition(value: unknown): value is "absolute" | "relative" {
  return value === "absolute" || value === "relative";
}

function isTextAlign(value: unknown): value is "left" | "right" | "center" {
  return value === "left" || value === "right" || value === "center";
}

function isTextDecoration(value: unknown): value is "underline" | "none" {
  return value === "underline" || value === "none";
}

function isColor(value: unknown): value is `#${string}` {
  return typeof value === "string" && value[0] === "#";
}

function convertColorToHex(value: unknown): `#${string}` | undefined {
  if (isColor(value)) {
    return value;
  }
  if (!value || typeof value !== "string") {
    return undefined;
  }

  const colorName = value.toLowerCase();
  if (colorName === "black") {
    return "#000000";
  }
  if (colorName === "white") {
    return "#ffffff";
  }
  return undefined;
}
