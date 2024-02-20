/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import React from "react";

import { ColorPicker } from "./ColorPicker";
import { DropDown } from "./DropDown";

type Props = {
  disabled?: boolean;
  buttonAriaLabel?: string;
  buttonClassName?: string;
  buttonIcon?: React.ReactElement;
  buttonLabel?: string;
  title?: string;
  stopCloseOnClickSelf?: boolean;
  color: string;
  colorType?: "text" | "background" | undefined;
  onChange?: (color: string, skipHistoryStack: boolean) => void;
};

export function DropdownColorPicker({
  disabled = false,
  stopCloseOnClickSelf = true,
  color,
  colorType,
  onChange,
  ...rest
}: Props) {
  let styleColor: string | undefined = getColor(color);
  let styleBackgroundColor: string | undefined = getContrastColor(styleColor);
  if (colorType === "background") {
    let temp = styleColor;
    styleColor = styleBackgroundColor;
    styleBackgroundColor = temp;
  }

  return (
    <DropDown
      {...rest}
      disabled={disabled}
      stopCloseOnClickSelf={stopCloseOnClickSelf}
      buttonStyle={{ color: styleColor, backgroundColor: styleBackgroundColor }}
    >
      <ColorPicker color={color} onChange={onChange} />
    </DropDown>
  );
}

function getColor(color: string | undefined): string | undefined {
  const hex = normalizeHex(color);
  if (!hex) {
    return;
  }
  return "#" + hex;
}

function getContrastColor(color: string | undefined): string | undefined {
  const hex = normalizeHex(color);
  if (!hex) {
    return;
  }

  const r = parseInt(hex.slice(0, 2), 16);
  const g = parseInt(hex.slice(2, 4), 16);
  const b = parseInt(hex.slice(4, 6), 16);
  const luminance = (r * 0.299 + g * 0.587 + b * 0.114) / 255;
  return luminance >= 0.5 ? "#000000" : "#FFFFFF";
}

function normalizeHex(str: string | undefined): string | undefined {
  if (!str || str.length === 0) {
    return;
  }

  let hex = str;
  if (hex.indexOf("#") === 0) {
    hex = hex.slice(1);
  }
  if (hex.length === 3) {
    hex = hex[0] + hex[0] + hex[1] + hex[1] + hex[2] + hex[2];
  }
  if (hex.length !== 6) {
    return undefined;
  }
  return hex;
}
