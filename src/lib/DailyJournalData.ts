import { DailyJournalDocument, DailyJournalDocumentItemBox } from "./DailyJournalDocument";
import type { DailyJournalHeaderOrFooterItem, DailyJournalItem } from "./DailyJournalItem";
import { Layout, LayoutItem } from "./layoutBuilder";
import type { LengthValue } from "./LengthValue";
import { convertLengthValueToInchesString, convertLengthValueToPx } from "./LengthValue";
import type { RichTextElementNode, TextBoxData } from "./TextBoxData";
import { calculateHeaderTextHeightPx } from "./TextBoxData";

export interface DailyJournalData {
  style: DailyJournalPageStyle;
  header: DailyJournalHeaderOrFooterItem | undefined;
  items: DailyJournalItem[];
}

// export interface DailyJournalLayoutData {
//   style: DailyJournalPageStyle;
//   header: DailyJournalHeaderOrFooterItem | undefined;
//   layout: Layout<DailyJournalLayoutItem> | undefined;
//   footer?: DailyJournalHeaderOrFooterItem | undefined;
// }

export interface DailyJournalPageStyle
  extends Pick<
    React.CSSProperties,
    "width" | "height" | "paddingBottom" | "paddingLeft" | "paddingRight" | "paddingTop" | "gap"
  > {
  width: number;
  height: number;
  paddingBottom: number;
  paddingLeft: number;
  paddingRight: number;
  paddingTop: number;
  gap: number;
}

type DailyJournalLayoutItem = LayoutItem & {
  innerItem: DailyJournalItem;

  /**
   * For a textBox item, the font size to use in the current layout.
   * This may be scaled down so the text fits in its layout cell.
   */
  fontSizeOverride?: string;
};

export function convertDailyJournalDataToDocument(
  data: DailyJournalData,
  layout: Layout<DailyJournalLayoutItem> | undefined,
): DailyJournalDocument {
  const gap = data.style.gap ?? 0;
  const leftOffset = data.style.paddingLeft ?? 0;
  let topOffset = data.style.paddingTop ?? 0;

  const itemBoxes: DailyJournalDocumentItemBox[] = [];
  const imageNameSet = new Set<string>();
  const fontFamilyNameSet = new Set<string>();

  const header = data.header;
  if (header) {
    const layoutWidth = data.style.width - leftOffset - (data.style.paddingRight ?? 0);

    //     | "backgroundColor"
    // | "borderColor"
    // | "borderRadius"
    // | "borderStyle"
    // | "borderWidth"
    // | "color"
    // | "fontFamily"
    // | "fontSize"
    // | "minHeight"
    // | "paddingBottom"
    // | "paddingLeft"
    // | "paddingRight"
    // | "paddingTop"
    // | "width"
    const {
      //backgroundColor,
      borderColor,
      borderRadius,
      borderStyle,
      borderWidth,
      paddingBottom,
      paddingLeft,
      paddingRight,
      paddingTop,
      width,
      ...otherHeaderStyle
    } = header.data.style ?? {};

    const headerItemBox: DailyJournalDocumentItemBox = {
      key: "header",
      item: {
        name: "header",
        type: "textBox",
        data: {
          style: {
            backgroundColor: otherHeaderStyle.backgroundColor,
            borderColor,
            borderRadius,
            borderStyle,
            borderWidth,
          },
        },
        width: header.width,
        height: header.height,
      },
      originalItem: header,
      style: {
        width: convertLengthValueToInchesString(layoutWidth),
        height: convertLengthValueToInchesString(header.height),
        position: "absolute",
        left: convertLengthValueToInchesString(leftOffset),
        top: convertLengthValueToInchesString(topOffset),
        //zIndex: 1,
      },
    };

    itemBoxes.push(headerItemBox);

    const paddingLeftPx = convertLengthValueToPx((paddingLeft as LengthValue) ?? gap);
    const paddingRightPx = convertLengthValueToPx((paddingRight as LengthValue) ?? gap);
    const paddingTopPx = convertLengthValueToPx((paddingTop as LengthValue) ?? gap);
    const paddingBottomPx = convertLengthValueToPx((paddingBottom as LengthValue) ?? gap);
    const borderWidthPx = convertLengthValueToPx((borderWidth as LengthValue) ?? 0);

    const headerItemBoxWidth = layoutWidth / 2 - gap - paddingLeftPx - paddingRightPx - borderWidthPx * 2;
    const headerItemBoxHeight = header.height - paddingTopPx - paddingBottomPx - borderWidthPx * 2;

    const headerLayoutContainer = header.data.richText?.children?.find((x) => x.type === "layoutContainer");
    const headerTitleLayoutItem = headerLayoutContainer?.children?.[0] as RichTextElementNode;
    const headerDateLayoutItem = headerLayoutContainer?.children?.[1] as RichTextElementNode;

    // const richText: RichTextRootNode = {
    //   type: "root",
    //   children: [
    //     {
    //       type: "layoutContainer",
    //       children: [
    //         {
    //           type: "layoutItem",
    //           style: { textAlign: "center" },
    //           children: [
    //             {
    //               type: "paragraph",
    //               children: [newTitleTextNode],
    //               style: {
    //                 textAlign: "center",
    //               },
    //             },
    //           ],
    //         },
    //         {
    //           type: "layoutItem",
    //           style: { textAlign: "center" },
    //           children: [
    //             {
    //               type: "paragraph",
    //               children: [newDateTextNode],
    //               style: {
    //                 textAlign: "center",
    //               },
    //             },
    //           ],
    //         },
    //       ],
    //     },
    //   ],
    // };

    if (headerTitleLayoutItem) {
      const headerTitleTextBoxData: TextBoxData = {
        style: { ...otherHeaderStyle, alignContent: "center" },
        richText: {
          type: "root",
          style: { ...headerTitleLayoutItem.style, alignContent: "center" },
          children: headerTitleLayoutItem.children,
        },
      };

      let topPx = topOffset + paddingTopPx + borderWidthPx;
      let heightPx = headerItemBoxHeight;
      const { height: heightPxOverride, lineHeight: lineHeightPxOverride } =
        calculateHeaderTextHeightPx(headerTitleTextBoxData) ?? {};
      //console.log("heightPxOverride", heightPxOverride);
      // if (heightPxOverride) {
      //   heightPxOverride = heightPxOverride - paddingTopPx - paddingBottomPx - borderWidthPx * 2;
      // }
      if (heightPxOverride && heightPxOverride < headerItemBoxHeight) {
        const heightDifference = headerItemBoxHeight - heightPxOverride;
        if (heightDifference > 1) {
          heightPx = heightPxOverride;
          topPx += heightDifference / 2;
        }
      }

      const headerTitleItemBox: DailyJournalDocumentItemBox = {
        key: "header-title",
        item: {
          name: "header-title",
          type: "textBox",
          data: headerTitleTextBoxData,
          width: header.width / 2,
          height: header.height,
        },
        originalItem: header,
        style: {
          width: convertLengthValueToInchesString(headerItemBoxWidth),
          height: convertLengthValueToInchesString(heightPx),
          position: "absolute",
          left: convertLengthValueToInchesString(leftOffset + paddingLeftPx + borderWidthPx),
          top: convertLengthValueToInchesString(topPx),
          //zIndex: 2,
        },
      };

      itemBoxes.push(headerTitleItemBox);
    }

    if (headerDateLayoutItem) {
      let headerDateTextBoxData: TextBoxData = {
        style: { ...otherHeaderStyle, alignContent: "center" },
        richText: {
          type: "root",
          //style: headerDateLayoutItem.style,
          style: { ...headerDateLayoutItem.style, alignContent: "center" },
          children: headerDateLayoutItem.children,
        },
      };

      let topPx = topOffset + paddingTopPx + borderWidthPx;
      let heightPx = headerItemBoxHeight;
      const { height: heightPxOverride, lineHeight: lineHeightPxOverride } =
        calculateHeaderTextHeightPx(headerDateTextBoxData) ?? {};
      // if (heightPxOverride) {
      //   heightPxOverride = heightPxOverride - paddingTopPx - paddingBottomPx - borderWidthPx * 2;
      // }
      //console.log("heightPxOverride?", headerItemBoxHeight, heightPxOverride);

      if (heightPxOverride && heightPxOverride < headerItemBoxHeight) {
        const heightDifference = headerItemBoxHeight - heightPxOverride;
        //console.log("heightDifference", heightDifference);
        if (heightDifference > 1) {
          heightPx = heightPxOverride;
          topPx += heightDifference / 2;
        }
      }

      const headerDateItemBox: DailyJournalDocumentItemBox = {
        key: "header-date",
        item: {
          name: "header-date",
          type: "textBox",
          data: headerDateTextBoxData,
          width: header.width / 2,
          height: header.height,
        },
        originalItem: header,
        style: {
          width: convertLengthValueToInchesString(headerItemBoxWidth),
          height: convertLengthValueToInchesString(heightPx),
          position: "absolute",
          left: convertLengthValueToInchesString(leftOffset + paddingLeftPx + borderWidthPx + gap + headerItemBoxWidth),
          top: convertLengthValueToInchesString(topPx),
          //zIndex: 2,
        },
      };
      itemBoxes.push(headerDateItemBox);
    }

    if (otherHeaderStyle?.fontFamily) {
      fontFamilyNameSet.add(otherHeaderStyle.fontFamily);
    }
    topOffset += header.height + gap;
  }

  if (layout) {
    for (const cell of layout.cells) {
      const itemBox: DailyJournalDocumentItemBox = {
        key: cell.item.key,
        item: cell.item.innerItem,
        style: {
          width: convertLengthValueToInchesString(cell.width),
          height: convertLengthValueToInchesString(cell.height),
          position: "absolute",
          left: convertLengthValueToInchesString(leftOffset + cell.left),
          top: convertLengthValueToInchesString(topOffset + cell.top),
        },
      };
      itemBoxes.push(itemBox);
      if (cell.item.innerItem.type === "image") {
        imageNameSet.add(cell.item.innerItem.name);
      }
      if (cell.item.innerItem.type === "textBox" && cell.item.innerItem.data.style?.fontFamily) {
        fontFamilyNameSet.add(cell.item.innerItem.data.style.fontFamily);
      }
    }
    //topOffset += layout.height + gap;
  }

  const document: DailyJournalDocument = {
    style: {
      width: convertLengthValueToInchesString(data.style.width),
      height: convertLengthValueToInchesString(data.style.height),
      position: "relative",
    },
    itemBoxes,
    imageNames: Array.from(imageNameSet),
    fontFamilyNames: Array.from(fontFamilyNameSet),
  };
  //console.log("document", document, data, layout);
  return document;
}
