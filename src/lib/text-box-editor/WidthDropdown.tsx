import React from "react";
import { IconSquare } from "../icons";
import { DropDown, DropDownItem } from "../ui/DropDown";
import { OptionalText } from "../ui/OptionalText";
import type { SimpleWidthType } from "./WidthType";

export interface WidthDropdownProps {
  value: SimpleWidthType | undefined;
  onChange: (newValue: SimpleWidthType) => void;
  disabled?: boolean;
}

const WIDTH_OPTIONS: {
  [key in SimpleWidthType]: {
    icon: React.ReactElement;
    name: string;
  };
} = {
  ["sm"]: {
    icon: <IconSquare />,
    name: "Small",
  },
  ["md"]: {
    icon: <IconSquare aspectRatio="2:1" />,
    name: "Medium",
  },
  ["lg"]: {
    icon: <IconSquare aspectRatio="3:1" />,
    name: "Large",
  },
};

export function WidthDropdown({ value, onChange, disabled = false }: WidthDropdownProps) {
  if (!value) {
    value = "md";
  }
  const option = WIDTH_OPTIONS[value];

  return (
    <DropDown disabled={disabled} buttonLabel={option.name} buttonIcon={option.icon} buttonAriaLabel="Width">
      {Object.keys(WIDTH_OPTIONS).map((widthString) => {
        const width = widthString as SimpleWidthType;
        const option = WIDTH_OPTIONS[width];
        return (
          <DropDownItem key={width} onClick={onChange.bind(undefined, width)} active={value === width}>
            {option.icon} <OptionalText>{option.name}</OptionalText>
          </DropDownItem>
        );
      })}
    </DropDown>
  );
}
