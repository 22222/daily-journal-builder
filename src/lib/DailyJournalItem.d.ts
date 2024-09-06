import type { TextBoxData } from "./TextBoxData";

export type DailyJournalItem = DailyJournalImageItem | DailyJournalTextBoxItem;

export interface DailyJournalImageItem extends DailyJournalItemBase {
  type: "image";
}

export interface DailyJournalTextBoxItem extends DailyJournalItemBase {
  type: "textBox";
  data: TextBoxData;
  floating?: boolean;
}

export interface DailyJournalHeaderOrFooterItem extends Omit<DailyJournalTextBoxItem, "floating" | "featured"> {
  height: number;
}

interface DailyJournalItemBase {
  /**
   * An identifier that uniquely identifies this item within this session for items of this type.
   * This may be an image file name or an incremented id for a text box.
   */
  name: string;

  /**
   * The original width of this item.
   */
  width: number;

  /**
   * The original height of this item.
   */
  height: number;

  /**
   * True to prefer layouts that make this item bigger.
   */
  featured?: boolean;

  // /**
  //  * Allow this item to span more than one row when possible.
  //  */
  // rowSpan?: 1 | 2;
}
