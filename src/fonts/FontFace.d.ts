export interface FontFace {
  fontFamily: string;
  fontFaceName: string;
  fontFamilyDisplayName?: string;
  fontWeight: "normal" | "bold";
  fontStyle: "normal" | "italic";
  base64: string;
}
