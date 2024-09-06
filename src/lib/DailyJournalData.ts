import { DailyJournalDocument, DailyJournalDocumentItemBox } from "./DailyJournalDocument";
import type { DailyJournalHeaderOrFooterItem, DailyJournalItem } from "./DailyJournalItem";
import { convertLengthValueToInchesString } from "./LengthValue";
import { Layout, LayoutItem } from "./layoutBuilder";

export interface DailyJournalData {
  style: DailyJournalPageStyle;
  header: DailyJournalHeaderOrFooterItem | undefined;
  items: DailyJournalItem[];
  footer?: DailyJournalHeaderOrFooterItem | undefined;
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
    const headerItemBox: DailyJournalDocumentItemBox = {
      key: "header",
      item: {
        name: "header",
        type: "textBox",
        data: header.data,
        width: header.width,
        height: header.height,
      },
      style: {
        width: convertLengthValueToInchesString(layoutWidth),
        height: convertLengthValueToInchesString(header.height),
        position: "absolute",
        left: convertLengthValueToInchesString(leftOffset),
        top: convertLengthValueToInchesString(topOffset),
      },
    };
    itemBoxes.push(headerItemBox);
    if (header.data.style?.fontFamily) {
      fontFamilyNameSet.add(header.data.style.fontFamily);
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

  const footer = data.footer;
  if (footer) {
    const footerItemBox: DailyJournalDocumentItemBox = {
      key: "footer",
      item: {
        name: "footer",
        type: "textBox",
        data: footer.data,
        width: data.style.width,
        height: footer.height,
      },
      style: {
        width: convertLengthValueToInchesString(data.style.width),
        height: convertLengthValueToInchesString(footer.height),
        position: "absolute",
        left: convertLengthValueToInchesString(leftOffset),
        top: convertLengthValueToInchesString(footer.height),
      },
    };
    itemBoxes.push(footerItemBox);
    if (footer.data.style?.fontFamily) {
      fontFamilyNameSet.add(footer.data.style.fontFamily);
    }
    //topOffset += footer.height + gap;
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
  return document;
}
