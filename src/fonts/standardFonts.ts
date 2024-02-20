import AliceRegular from "./Alice/Alice-Regular.ttf";
import ArimoBold from "./Arimo/Arimo-Bold.ttf";
import ArimoBoldItalic from "./Arimo/Arimo-BoldItalic.ttf";
import ArimoItalic from "./Arimo/Arimo-Italic.ttf";
import ArimoRegular from "./Arimo/Arimo-Regular.ttf";
import ComicNeueBold from "./Comic_Neue/ComicNeue-Bold.ttf";
import ComicNeueBoldItalic from "./Comic_Neue/ComicNeue-BoldItalic.ttf";
import ComicNeueItalic from "./Comic_Neue/ComicNeue-Italic.ttf";
import ComicNeueRegular from "./Comic_Neue/ComicNeue-Regular.ttf";
import CousineBold from "./Cousine/Cousine-Bold.ttf";
import CousineBoldItalic from "./Cousine/Cousine-BoldItalic.ttf";
import CousineItalic from "./Cousine/Cousine-Italic.ttf";
import CousineRegular from "./Cousine/Cousine-Regular.ttf";
import DancingScriptBold from "./Dancing_Script/DancingScript-Bold.ttf";
import DancingScriptRegular from "./Dancing_Script/DancingScript-Regular.ttf";
import IndieFlowerRegular from "./Indie_Flower/IndieFlower-Regular.ttf";
import TinosBold from "./Tinos/Tinos-Bold.ttf";
import TinosBoldItalic from "./Tinos/Tinos-BoldItalic.ttf";
import TinosItalic from "./Tinos/Tinos-Italic.ttf";
import TinosRegular from "./Tinos/Tinos-Regular.ttf";

import type { FontFace } from "./FontFace";

export interface FontFamily {
  Regular: string;
  Bold?: string;
  Italic?: string;
  BoldItalic?: string;
}

export const standardFontFamilies = {
  Alice: { Regular: AliceRegular } as FontFamily,
  Arimo: { Bold: ArimoBold, BoldItalic: ArimoBoldItalic, Italic: ArimoItalic, Regular: ArimoRegular } as FontFamily,
  Comic_Neue: {
    Bold: ComicNeueBold,
    BoldItalic: ComicNeueBoldItalic,
    Italic: ComicNeueItalic,
    Regular: ComicNeueRegular,
  } as FontFamily,
  Cousine: {
    Bold: CousineBold,
    BoldItalic: CousineBoldItalic,
    Italic: CousineItalic,
    Regular: CousineRegular,
  } as FontFamily,
  Dancing_Script: { Bold: DancingScriptBold, Regular: DancingScriptRegular } as FontFamily,
  Indie_Flower: { Regular: IndieFlowerRegular } as FontFamily,
  Tinos: { Bold: TinosBold, BoldItalic: TinosBoldItalic, Italic: TinosItalic, Regular: TinosRegular } as FontFamily,
} as const;

function flattenFontFamilies(fontFamilies: Record<string, FontFamily>) {
  const sansSerifFontFamily = "Arimo";
  const serifFontFamily = "Tinos";
  const monospaceFontFamily = "Cousine";

  const fonts: FontFace[] = [];
  if (fontFamilies[sansSerifFontFamily]) {
    pushFontFamilyFonts(fonts, fontFamilies[sansSerifFontFamily], sansSerifFontFamily, "Default Sans Serif");
  }
  if (fontFamilies[serifFontFamily]) {
    pushFontFamilyFonts(fonts, fontFamilies[serifFontFamily], serifFontFamily, "Default Serif");
  }
  if (fontFamilies[monospaceFontFamily]) {
    pushFontFamilyFonts(fonts, fontFamilies[monospaceFontFamily], monospaceFontFamily, "Default Monospace");
  }
  for (const fontFamily of Object.keys(fontFamilies)) {
    if (fontFamily === sansSerifFontFamily || fontFamily === serifFontFamily || fontFamily === monospaceFontFamily) {
      continue;
    }

    let fontFamilyDisplayName: string | undefined;
    if (fontFamily.includes("_")) {
      fontFamilyDisplayName = fontFamily.replace(/_/g, " ");
    }

    const fontFamilyObj = fontFamilies[fontFamily];
    pushFontFamilyFonts(fonts, fontFamilyObj, fontFamily, fontFamilyDisplayName);
  }
  return fonts;
}

function pushFontFamilyFonts(
  fonts: FontFace[],
  fontFamilyObj: FontFamily,
  fontFamily: string,
  fontFamilyDisplayName: string | undefined,
) {
  if (fontFamilyObj.Regular) {
    fonts.push({
      fontFamily,
      fontFamilyDisplayName,
      fontFaceName: `${fontFamily}-Regular`,
      fontWeight: "normal",
      fontStyle: "normal",
      base64: fontFamilyObj.Regular,
    });
  }
  if (fontFamilyObj.Bold) {
    fonts.push({
      fontFamily,
      fontFamilyDisplayName,
      fontFaceName: `${fontFamily}-Bold`,
      fontWeight: "bold",
      fontStyle: "normal",
      base64: fontFamilyObj.Bold,
    });
  }
  if (fontFamilyObj.Italic) {
    fonts.push({
      fontFamily,
      fontFamilyDisplayName,
      fontFaceName: `${fontFamily}-Italic`,
      fontWeight: "normal",
      fontStyle: "italic",
      base64: fontFamilyObj.Italic,
    });
  }
  if (fontFamilyObj.BoldItalic) {
    fonts.push({
      fontFamily,
      fontFamilyDisplayName,
      fontFaceName: `${fontFamily}-BoldItalic`,
      fontWeight: "bold",
      fontStyle: "italic",
      base64: fontFamilyObj.BoldItalic,
    });
  }
}

export const standardFonts = flattenFontFamilies(standardFontFamilies);
