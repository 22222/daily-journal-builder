/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import React from "react";
import { IconFontFamily } from "../icons";
import { DropDown, DropDownItem } from "../ui/DropDown";

export interface FontFamilyDropDownProps {
  options: FontFamilyOption[];
  value: string;
  onClick: (options: string) => void;
  disabled?: boolean;
}

export interface FontFamilyOption {
  value: string;
  label?: string;
}

export function FontFamilyDropDown({
  options,
  onClick,
  value,
  disabled = false,
}: FontFamilyDropDownProps): React.ReactElement {
  const handleClick = React.useCallback(
    (option: string) => {
      onClick(option);
    },
    [onClick],
  );

  const buttonLabel = React.useMemo(() => {
    const option = options.find((option) => option.value === value);
    return option?.label ?? value;
  }, [value, options]);

  return (
    <DropDown disabled={disabled} buttonLabel={buttonLabel} buttonIcon={<IconFontFamily />} buttonAriaLabel="Font">
      {options.map((option) => (
        <DropDownItem
          active={value === option.value}
          style={{ fontFamily: option.value }}
          onClick={() => handleClick(option.value)}
          key={option.value}
        >
          {option.label ?? option.value}
        </DropDownItem>
      ))}
    </DropDown>
  );
}
