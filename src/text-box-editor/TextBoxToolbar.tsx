import React from "react";
import type { LengthValue } from "../LengthValue";
import { convertLengthValueToPxOrUndefined } from "../LengthValue";
import type { TextBoxStyle } from "../TextBoxData";
import type { FontFace } from "../fonts/FontFace";
import { IconBgColor, IconFontColor, IconBorderColor } from "../icons";
import { DropdownColorPicker } from "../ui/DropdownColorPicker";
import { FontFamilyDropDown } from "./FontFamilyDropDown";
import { FontSizeInput } from "./FontSizeInput";
import { WidthDropdown } from "./WidthDropdown";
import type { WidthType } from "./WidthType";
import { convertLengthValueToWidthType, convertWidthTypeToLengthValue } from "./WidthType";
import { BorderStyleDropdown } from "./BorderStyleDropdown";
import type { BorderStyle } from "./BorderStyleDropdown";
import { SizeInput } from "./SizeInput";
import type { Size } from "./Size";
import { convertSizeToPxOrUndefined, convertLengthValueToSizeOrUndefined } from "./Size";

export interface TextBoxToolbarProps {
  textBoxStyle: TextBoxStyle;
  setTextBoxStyle: (newStyle: TextBoxStyle) => void;
  pageWidth: LengthValue;
  fonts: FontFace[];
}

const FONT_FAMILY_PREFIX = "";
const DEFAULT_FONT_FAMILY_OPTIONS: Array<{ value: string; label?: string }> = [
  { value: "Helvetica" },
  { value: "Times" },
  { value: "Courier" },
];

export function TextBoxToolbar({ textBoxStyle, setTextBoxStyle, pageWidth, fonts }: TextBoxToolbarProps) {
  const pageWidthPx = React.useMemo(() => convertLengthValueToPxOrUndefined(pageWidth), [pageWidth]);
  const widthType = React.useMemo(
    () => convertLengthValueToWidthType(textBoxStyle.width, pageWidthPx),
    [textBoxStyle.width, pageWidthPx],
  );

  const fontFamilyOptions = React.useMemo(() => {
    const options: Array<{ value: string; label?: string }> = [];
    const fontFamilySet = new Set<string>();
    for (const font of fonts) {
      if (fontFamilySet.has(font.fontFamily)) {
        continue;
      }

      options.push({
        value: FONT_FAMILY_PREFIX + font.fontFamily,
        label: font.fontFamilyDisplayName ?? font.fontFamily,
      });
      fontFamilySet.add(font.fontFamily);
    }
    if (options.length === 0) {
      options.push(...DEFAULT_FONT_FAMILY_OPTIONS);
    }
    return options;
  }, fonts);

  const handleChangeWidth = (value: WidthType) => {
    const width = convertWidthTypeToLengthValue(value, pageWidthPx);
    if (textBoxStyle.width === width) {
      return;
    }
    const newStyle: TextBoxStyle = { ...textBoxStyle, width: width };
    setTextBoxStyle(newStyle);
  };
  const handleChangeFontFamily = (value: string) => {
    if (textBoxStyle.fontFamily === value) {
      return;
    }
    const newStyle: TextBoxStyle = { ...textBoxStyle, fontFamily: value };
    setTextBoxStyle(newStyle);
  };
  const handleChangeFontSize = (value: `${number}pt` | undefined) => {
    if (textBoxStyle.fontSize === value) {
      return;
    }
    const newStyle: TextBoxStyle = { ...textBoxStyle, fontSize: value };
    setTextBoxStyle(newStyle);
  };
  const handleChangeFontColor = (value: string) => {
    if (textBoxStyle.color === value) {
      return;
    }
    const newStyle: TextBoxStyle = { ...textBoxStyle, color: value };
    setTextBoxStyle(newStyle);
  };
  const handleChangeBackgroundColor = (value: string) => {
    if (textBoxStyle.backgroundColor === value) {
      return;
    }
    const newStyle: TextBoxStyle = { ...textBoxStyle, backgroundColor: value };
    setTextBoxStyle(newStyle);
  };

  const handleChangeMargin = (value: Size | undefined) => {
    const valuePx = convertSizeToPxOrUndefined(value);
    if (
      textBoxStyle.paddingTop === valuePx &&
      textBoxStyle.paddingBottom === valuePx &&
      textBoxStyle.paddingLeft === valuePx &&
      textBoxStyle.paddingRight === valuePx
    ) {
      return;
    }
    const newStyle: TextBoxStyle = {
      ...textBoxStyle,
      paddingTop: valuePx,
      paddingBottom: valuePx,
      paddingLeft: valuePx,
      paddingRight: valuePx,
    };
    setTextBoxStyle(newStyle);
  };
  // const handleChangeMarginVertical = (value: Size | undefined) => {
  //   const valuePx = convertSizeToPxOrUndefined(value);
  //   if (textBoxStyle.paddingTop === valuePx && textBoxStyle.paddingBottom === valuePx) {
  //     return;
  //   }
  //   const newStyle: TextBoxStyle = { ...textBoxStyle, paddingTop: valuePx, paddingBottom: valuePx };
  //   setTextBoxStyle(newStyle);
  // };
  // const handleChangeMarginHorizontal = (value: Size | undefined) => {
  //   const valuePx = convertSizeToPxOrUndefined(value);
  //   if (textBoxStyle.paddingLeft === valuePx && textBoxStyle.paddingRight === valuePx) {
  //     return;
  //   }
  //   const newStyle: TextBoxStyle = { ...textBoxStyle, paddingLeft: valuePx, paddingRight: valuePx };
  //   setTextBoxStyle(newStyle);
  // };

  const handleChangeBorderStyle = (value: BorderStyle) => {
    const valueOrUndefined = value !== "none" ? value : undefined;
    if (textBoxStyle.borderStyle === valueOrUndefined) {
      return;
    }
    const newStyle: TextBoxStyle = { ...textBoxStyle, borderStyle: valueOrUndefined };
    setTextBoxStyle(newStyle);
  };
  const handleChangeBorderRadius = (value: Size | undefined) => {
    const valuePx = convertSizeToPxOrUndefined(value);
    if (textBoxStyle.borderRadius === valuePx) {
      return;
    }
    const newStyle: TextBoxStyle = { ...textBoxStyle, borderRadius: valuePx };
    setTextBoxStyle(newStyle);
  };
  const handleChangeBorderWidth = (value: Size | undefined) => {
    const valuePx = convertSizeToPxOrUndefined(value);
    if (textBoxStyle.borderWidth === valuePx) {
      return;
    }
    const newStyle: TextBoxStyle = { ...textBoxStyle, borderWidth: valuePx };
    setTextBoxStyle(newStyle);
  };
  const handleChangeBorderColor = (value: string) => {
    if (textBoxStyle.borderColor === value) {
      return;
    }
    const newStyle: TextBoxStyle = { ...textBoxStyle, borderColor: value };
    setTextBoxStyle(newStyle);
  };

  return (
    <div className="btn-toolbar gap-1">
      <div className="btn-group">
        <WidthDropdown value={widthType} onChange={handleChangeWidth} />
      </div>
      <div className="btn-group">
        <FontFamilyDropDown
          options={fontFamilyOptions}
          value={textBoxStyle.fontFamily ?? ""}
          onClick={handleChangeFontFamily}
        />
      </div>
      <div className="btn-group">
        <FontSizeInput value={textBoxStyle.fontSize} onChange={handleChangeFontSize} />
      </div>
      <div className="btn-group">
        <div className="btn-group">
          <DropdownColorPicker
            buttonAriaLabel="Text color"
            buttonIcon={<IconFontColor />}
            color={textBoxStyle.color ?? ""}
            onChange={handleChangeFontColor}
            title="Text color"
          />
        </div>
        <div className="btn-group">
          <DropdownColorPicker
            buttonAriaLabel="Background color"
            buttonIcon={<IconBgColor />}
            color={textBoxStyle.backgroundColor ?? ""}
            colorType="background"
            onChange={handleChangeBackgroundColor}
            title="Background color"
          />
        </div>
      </div>
      <div className="btn-group">
        <SizeInput
          label="Margin"
          value={convertLengthValueToSizeOrUndefined(
            textBoxStyle.paddingLeft ??
              textBoxStyle.paddingTop ??
              textBoxStyle.paddingRight ??
              textBoxStyle.paddingBottom,
          )}
          onChange={handleChangeMargin}
        />
      </div>
      <div className="btn-group">
        <BorderStyleDropdown value={textBoxStyle.borderStyle} onChange={handleChangeBorderStyle} />
        <SizeInput
          label="Width"
          value={convertLengthValueToSizeOrUndefined(textBoxStyle.borderWidth)}
          onChange={handleChangeBorderWidth}
          disabled={!textBoxStyle.borderStyle}
        />
        <DropdownColorPicker
          buttonAriaLabel="Border color"
          buttonIcon={<IconBorderColor />}
          color={textBoxStyle.borderColor ?? ""}
          colorType="text"
          onChange={handleChangeBorderColor}
          title="Border color"
        />
        <SizeInput
          label="Rounded"
          value={convertLengthValueToSizeOrUndefined(textBoxStyle.borderRadius)}
          onChange={handleChangeBorderRadius}
          disabled={!textBoxStyle.borderStyle}
        />
      </div>
    </div>
  );
}
