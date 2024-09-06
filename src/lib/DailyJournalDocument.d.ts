import type { CssOrPdfProperties } from "./CssOrPdfProperties";
import type { DailyJournalItem } from "./DailyJournalItem";
import type { TextBoxData } from "./TextBoxData";
import { FontFace } from "./fonts/FontFace";

/**
 * An abstract document exported for a Daily Journal.
 * It can be used to generate other formats, like a PDF or a Word document.
 */
export interface DailyJournalDocument {
  /**
   * The base style of this document.
   */
  style: DailyJournalDocumentStyle;

  /**
   * The item boxes to display in this document.
   */
  itemBoxes: DailyJournalDocumentItemBox[];

  /**
   * The names of all of the images in this document.
   */
  imageNames: string[];

  /**
   * The names of all of the font families in this document.
   */
  fontFamilyNames: string[];
}

/**
 * Additional data used by the document, like the image and font binary data.
 */
export interface DailyJournalDocumentContext {
  /**
   * A map from image name to data for the images used in the document (if any).
   */
  imagesRecord: Record<string, File | Blob>;

  /**
   * The fonts used in the document (if any).
   */
  fonts: FontFace[];
}

export interface DailyJournalDocumentStyle
  extends Pick<
    CssOrPdfProperties,
    "width" | "height" | "position"
    //| "paddingTop" | "paddingRight" | "paddingBottom" | "paddingLeft"
  > {
  width: `${number}in` | "0";
  height: `${number}in` | "0";
  position: "relative";
  // paddingTop: `${number}in` | "0";
  // paddingRight: `${number}in` | "0";
  // paddingBottom: `${number}in` | "0";
  // paddingLeft: `${number}in` | "0";
}

/**
 * A box around an item in a document.
 */
export interface DailyJournalDocumentItemBox {
  key: string;

  /**
   * The style of this item box.
   * These styles should override some of the styles of the actual item (like the width may be less than the item's width, and a fontSize should override the font size of a textbox item).
   */
  style: DailyJournalDocumentItemBoxStyle;

  /**
   * The item in this box.
   * This may be an image or text.
   */
  item: DailyJournalItem;
}

/**
 * The style of a item box.
 */
export interface DailyJournalDocumentItemBoxStyle
  extends Pick<CssOrPdfProperties, "height" | "left" | "top" | "width" | "fontSize"> {
  /**
   * The width of this item box (using border-box box sizing).
   * This may be smaller than the width of the item in this box, in which case it should be scaled down to this width.
   */
  width: `${number}in` | "0";

  /**
   * The height of this item box (using border-box box sizing).
   * This may be smaller than the width of the item in this box, in which case it should be scaled down to this width.
   */
  height: `${number}in` | "0";

  /**
   * Item boxes are positioned absolutely relative to the page body.
   */
  position: "absolute";

  /**
   * The offset to the top of this item box within the page body.
   */
  top: `${number}in` | "0";

  /**
   * The offset to the left of this item box within the page body.
   */
  left: `${number}in` | "0";

  /**
   * An override for a text-based item's font size, scaled down to something that should fit in the width/height.
   */
  fontSize?: `${number}pt`;
}
