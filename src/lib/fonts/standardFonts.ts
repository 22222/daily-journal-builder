import AliceRegular from "./Alice/Alice-Regular.ttf?url";
import ArimoBold from "./Arimo/Arimo-Bold.ttf?url";
import ArimoBoldItalic from "./Arimo/Arimo-BoldItalic.ttf?url";
import ArimoItalic from "./Arimo/Arimo-Italic.ttf?url";
import ArimoRegular from "./Arimo/Arimo-Regular.ttf?url";
import ComicNeueBold from "./Comic_Neue/ComicNeue-Bold.ttf?url";
import ComicNeueBoldItalic from "./Comic_Neue/ComicNeue-BoldItalic.ttf?url";
import ComicNeueItalic from "./Comic_Neue/ComicNeue-Italic.ttf?url";
import ComicNeueRegular from "./Comic_Neue/ComicNeue-Regular.ttf?url";
import CousineBold from "./Cousine/Cousine-Bold.ttf?url";
import CousineBoldItalic from "./Cousine/Cousine-BoldItalic.ttf?url";
import CousineItalic from "./Cousine/Cousine-Italic.ttf?url";
import CousineRegular from "./Cousine/Cousine-Regular.ttf?url";
import DancingScriptBold from "./Dancing_Script/DancingScript-Bold.ttf?url";
import DancingScriptRegular from "./Dancing_Script/DancingScript-Regular.ttf?url";
import IndieFlowerRegular from "./Indie_Flower/IndieFlower-Regular.ttf?url";
import TinosBold from "./Tinos/Tinos-Bold.ttf?url";
import TinosBoldItalic from "./Tinos/Tinos-BoldItalic.ttf?url";
import TinosItalic from "./Tinos/Tinos-Italic.ttf?url";
import TinosRegular from "./Tinos/Tinos-Regular.ttf?url";

import type { FontFace } from "./FontFace";

//console.log("AliceRegular", AliceRegular);

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
      url: fontFamilyObj.Regular,
    });
  }
  if (fontFamilyObj.Bold) {
    fonts.push({
      fontFamily,
      fontFamilyDisplayName,
      fontFaceName: `${fontFamily}-Bold`,
      fontWeight: "bold",
      fontStyle: "normal",
      url: fontFamilyObj.Bold,
    });
  }
  if (fontFamilyObj.Italic) {
    fonts.push({
      fontFamily,
      fontFamilyDisplayName,
      fontFaceName: `${fontFamily}-Italic`,
      fontWeight: "normal",
      fontStyle: "italic",
      url: fontFamilyObj.Italic,
    });
  }
  if (fontFamilyObj.BoldItalic) {
    fonts.push({
      fontFamily,
      fontFamilyDisplayName,
      fontFaceName: `${fontFamily}-BoldItalic`,
      fontWeight: "bold",
      fontStyle: "italic",
      url: fontFamilyObj.BoldItalic,
    });
  }
}

export const standardFonts = flattenFontFamilies(standardFontFamilies);
