import { Document, Font, Image, Page, Text, View, pdf } from "@react-pdf/renderer";
import type { Style } from "@react-pdf/types";
import React from "react";

import { CssOrPdfProperties, convertToCssOrPdfProperties } from "./CssOrPdfProperties";
import type { DailyJournalDocument, DailyJournalDocumentContext } from "./DailyJournalDocument";
import type { LengthValue } from "./LengthValue";
import {
  convertLengthValueToInchesStringOrUndefined,
  convertLengthValueToPx,
  convertLengthValueToPxOrUndefined,
} from "./LengthValue";
import type { RichTextElementNode, RichTextNode, TextBoxData } from "./TextBoxData";
import { FontFace } from "./fonts/FontFace";

if (!("__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED" in React))
  (React as any).__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED = {};

export function generatePdfBlob(document: DailyJournalDocument, context: DailyJournalDocumentContext): Promise<Blob> {
  //console.log("document", document);
  // Fonts appear to be a global resource?
  // So we'll clear out any previously registered fonts before registering the ones for this document.
  Font.clear();
  const groupings = objectGroupBy(context.fonts, (font) => font.fontFamily);

  // The default fallback font for react-pdf is Helvetica, so we need to make sure that we have a font registered with that name.
  if (!groupings["Helvetica"]) {
    const defaultFontFamilyName = Object.keys(groupings)[0];
    if (defaultFontFamilyName) {
      groupings["Helvetica"] = groupings[defaultFontFamilyName];
    }
  }

  for (const fontFamily of Object.keys(groupings)) {
    const grouping = groupings[fontFamily];
    if (!grouping || grouping.length === 0) {
      continue;
    }

    const fontFaces = grouping.map((font) => {
      let src = font.url;
      if (!src) {
        src = `data:font/ttf;base64,${font.base64}`;
      }
      return {
        src: src,
        fontStyle: font.fontStyle,
        fontWeight: font.fontWeight,
      };
    });

    // Make sure we have all of the bold/italic variants (or we'll get an error when we try to generat the PDF).
    const normalFontFace = fontFaces.find((x) => x.fontWeight === "normal" && x.fontStyle === "normal");
    if (normalFontFace) {
      if (!fontFaces.find((x) => x.fontWeight === "bold")) {
        fontFaces.push({ src: normalFontFace.src, fontWeight: "bold", fontStyle: "normal" });
      }
      if (!fontFaces.find((x) => x.fontStyle === "italic")) {
        fontFaces.push({ src: normalFontFace.src, fontWeight: "normal", fontStyle: "italic" });
      }
      if (!fontFaces.find((x) => x.fontWeight === "bold" && x.fontStyle === "italic")) {
        const boldItalicFontFace = fontFaces.find((x) => x.fontWeight === "bold") ?? normalFontFace;
        fontFaces.push({ src: boldItalicFontFace.src, fontWeight: "bold", fontStyle: "italic" });
      }
    }

    Font.register({
      family: fontFamily,
      fonts: fontFaces,
    });
  }

  return pdf(<DailyJournalPdfDocument document={document} context={context} />).toBlob();
}

const objectGroupBy = (() => {
  if ("groupBy" in Object && typeof Object.groupBy === "function") {
    return Object.groupBy as <K extends PropertyKey, T>(
      items: T[],
      keySelector: (item: T, index: number) => K,
    ) => Partial<Record<string, T[]>>;
  }

  function objectGroupBy<K extends PropertyKey, T>(
    items: T[],
    keySelector: (item: T, index: number) => K,
  ): Partial<Record<string, T[]>> {
    return items.reduce(
      (acc, value, index) => {
        (acc[keySelector(value, index).toString()] ||= []).push(value);
        return acc;
      },
      {} as { [key: string]: T[] },
    );
  }
  return objectGroupBy;
})();

const mapGroupBy = (() => {
  if ("groupBy" in Map && typeof Map.groupBy === "function") {
    return Map.groupBy as <K extends PropertyKey, T>(
      items: T[],
      keySelector: (item: T, index: number) => K,
    ) => Map<string, T[]>;
  }

  function mapGroupBy<K extends PropertyKey, T>(
    items: T[],
    keySelector: (item: T, index: number) => K,
  ): Map<string, T[]> {
    const map = new Map();
    let i = 0;
    for (const value of items) {
      const key = keySelector(value, i++);
      const list = map.get(key);
      if (list) {
        list.push(value);
      } else {
        map.set(key, [value]);
      }
    }
    return map;
  }
  return mapGroupBy;
})();

function DailyJournalPdfDocument({
  document,
  context,
}: {
  document: DailyJournalDocument;
  context: DailyJournalDocumentContext;
}) {
  return (
    <Document>
      <Page
        size="LETTER"
        //size={document.pageSize}
        orientation="portrait"
        style={document.style as Style}
      >
        <View>
          {document.itemBoxes.map((itemBox) => {
            if (itemBox.item.type === "image") {
              const imageData = context.imagesRecord[itemBox.item.name];
              if (!imageData) {
                return null;
              }
              return <Image key={itemBox.key} src={imageData} style={itemBox.style as Style} />;
            }
            if (itemBox.item.type === "textBox") {
              return (
                <TextBoxDataView
                  key={itemBox.key}
                  data={itemBox.item.data}
                  styleOverride={itemBox.style}
                  fontSizeOverride={itemBox.style.fontSize}
                  context={context}
                />
              );
            }
            return null;
          })}
        </View>
      </Page>
    </Document>
  );
}

function TextBoxDataView({
  data,
  styleOverride,
  fontSizeOverride,
  context,
}: {
  data: TextBoxData;
  styleOverride: CssOrPdfProperties | undefined;
  fontSizeOverride: string | undefined;
  context: DailyJournalDocumentContext;
}) {
  const { width, height, minHeight, fontSize, ...otherStyle } = convertToCssOrPdfProperties(data.style) ?? {};
  const style: Style = {
    ...otherStyle,
    fontSize: fontSizeOverride ?? fontSize,
    //overflow: "hidden",
    //textOverflow: "ellipsis",
    ...styleOverride,
  };

  const registeredFontMap = React.useMemo(() => {
    const map = mapGroupBy(context.fonts, (font) => font.fontFamily);
    return map;
  }, [context.fonts]);

  let parentWidth = convertLengthValueToPxOrUndefined(width) ?? 0;
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

  let parentHeight = convertLengthValueToPxOrUndefined(height) ?? 0;
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

  const richTextNodeContext: RichTextNodeContext = {
    registeredFontMap,
    parent: undefined,
    parentWidth,
    parentHeight,
    fontFamily: Array.isArray(style?.fontFamily) ? style.fontFamily[0] : style?.fontFamily,
    fontWeight: style?.fontWeight,
    fontStyle: style?.fontStyle,
  };

  let textElement: React.ReactNode;
  if (data.richText) {
    textElement = <RichTextNodeView node={data.richText} context={richTextNodeContext} />;
  } else if (data.text) {
    textElement = <Text style={{ fontFamily: richTextNodeContext.fontFamily }}>{data.text}</Text>;
  } else {
    textElement = null;
  }
  return <View style={style}>{textElement}</View>;
}

interface RichTextNodeContext {
  registeredFontMap: Map<string, FontFace[]>;
  parent: RichTextElementNode | undefined;
  parentWidth: LengthValue | undefined;
  parentHeight: LengthValue | undefined;
  fontFamily: string | undefined;
  fontWeight: CssOrPdfProperties["fontWeight"] | Style["fontWeight"] | undefined;
  fontStyle: CssOrPdfProperties["fontStyle"] | Style["fontStyle"] | undefined;
}

//const allowFlexbox = true;
function RichTextNodeView({ node, context }: { node: RichTextNode; context: RichTextNodeContext }) {
  if (node.type === "text") {
    return <Text style={convertToCssOrPdfProperties(node.style) as Style}>{node.text}</Text>;
  }

  let width = context.parentWidth;

  let style = convertToCssOrPdfProperties(node.style);
  let pdfStyle: Style | undefined;
  // if (node.type === "layoutContainer") {
  //   if (allowFlexbox) {
  //     pdfStyle = {
  //       ...style,
  //       display: "flex",
  //       flexDirection: "row",
  //       flexWrap: "nowrap",
  //       justifyContent: "space-between",
  //       alignItems: "stretch",
  //       // borderWidth: convertLengthValueToInchesStringOrUndefined(1),
  //       // borderColor: "pink",
  //       // borderStyle: "solid",
  //     };
  //   } else {
  //     style = {
  //       ...style,
  //       position: "relative",
  //     };
  //   }
  // } else if (node.type === "layoutItem") {
  //   if (allowFlexbox) {
  //     //style = { ...style, flexGrow: 1 };
  //     let align: (Style["alignItems"] & Style["alignSelf"] & Style["justifyContent"]) | undefined;
  //     if (style?.textAlign) {
  //       if (style.textAlign === "left") {
  //         align = "flex-start";
  //       } else if (style.textAlign === "right") {
  //         align = "flex-end";
  //       } else {
  //         align = style.textAlign;
  //       }
  //     }
  //     pdfStyle = {
  //       ...style,
  //       flexGrow: 1,
  //       display: "flex",
  //       flexDirection: "row",
  //       alignItems: "center",
  //       justifyContent: align,
  //       alignSelf: align,
  //       //height: convertLengthValueToInchesStringOrUndefined(parentHeight),
  //       // borderWidth: convertLengthValueToInchesStringOrUndefined(1),
  //       // borderColor: "red",
  //       // borderStyle: "solid",
  //     };
  //     width = undefined;
  //   } else
  //   {
  //     const rowItemCount = Math.max(context.parent?.children.length ?? 0, 1);
  //     const rowItemIndex = Math.max(context.parent?.children?.indexOf(node) ?? -1, 0);
  //     const itemWidth = (convertLengthValueToPxOrUndefined(context.parentWidth) ?? 0) / rowItemCount;
  //     const left = itemWidth * rowItemIndex;
  //     let justifyContent: Style["justifyContent"] | undefined;
  //     if (style?.textAlign === "left") {
  //       justifyContent = "flex-start";
  //     } else if (style?.textAlign === "right") {
  //       justifyContent = "flex-end";
  //     } else {
  //       justifyContent = style?.textAlign;
  //     }
  //     pdfStyle = {
  //       ...style,
  //       position: "absolute",
  //       left: convertLengthValueToInchesStringOrUndefined(left),
  //       top: "0",
  //       width: convertLengthValueToInchesStringOrUndefined(itemWidth),
  //       height: convertLengthValueToInchesStringOrUndefined(context.parentHeight),
  //       display: "flex",
  //       alignItems: "center",
  //       justifyContent,
  //     };
  //     width = itemWidth;
  //   }
  // } else
  if (node.type === "root") {
    style = { ...style };
    if (style.alignContent === "center" && style.textAlign === "center") {
      pdfStyle = {
        ...style,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      };
      //console.log("pdfStyle", pdfStyle);
    }
  } else if (node.type === "paragraph") {
    style = { ...style };
    //style = { ...style, borderColor: "black", borderWidth: 1, borderStyle: "solid" } as any;
  } else {
    throw new Error(`Unknown node type: ${node.type}`);
    //style = { ...style };
  }

  const childContext: RichTextNodeContext = {
    ...context,
    parent: node,
    parentWidth: width,
    fontFamily: style?.fontFamily ?? context.fontFamily,
    fontWeight: style?.fontWeight ?? context.fontWeight,
    fontStyle: style?.fontStyle ?? context.fontStyle,
  };

  // // Manually choose the correct font face name if the style is bold or italic.
  // // react-pdf doesn't seem to do this automatically, but maybe they will in the future?
  // if (style?.fontFamily) {
  //   const fontFaces = context.registeredFontMap.get(style.fontFamily) ?? [];
  //   let fontFaceName: string | undefined;
  //   if (style.fontWeight === "bold" && style.fontStyle === "italic") {
  //     fontFaceName = (
  //       fontFaces.find((x) => x.fontWeight === "bold" && x.fontStyle === "italic") ??
  //       fontFaces.find((x) => x.fontWeight === "bold")
  //     )?.fontFaceName;
  //   } else if (style.fontWeight === "bold") {
  //     fontFaceName = fontFaces.find((x) => x.fontWeight === "bold")?.fontFaceName;
  //   } else if (style.fontStyle === "italic") {
  //     fontFaceName = fontFaces.find((x) => x.fontStyle === "italic")?.fontFaceName;
  //   }

  //   if (fontFaceName && fontFaceName !== style.fontFamily) {
  //     console.log("Chose font face name", fontFaceName);
  //     if (pdfStyle) {
  //       pdfStyle = { ...pdfStyle, fontFamily: fontFaceName };
  //     } else {
  //       style = { ...style, fontFamily: fontFaceName };
  //     }
  //   }
  // }

  return (
    <View style={pdfStyle ?? (style as Style)}>
      {node.children.map((childNode, i) => (
        <RichTextNodeView key={i} node={childNode} context={childContext} />
      ))}
    </View>
  );
}
