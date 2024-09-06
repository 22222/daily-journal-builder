import React from "react";
import { IconBorderStyle, IconBorderStyleDashed, IconBorderStyleDotted, IconBorderStyleSolid } from "../icons";
import { DropDown, DropDownItem } from "../ui/DropDown";
import { OptionalText } from "../ui/OptionalText";

export type BorderStyle = "none" | "solid" | "dashed" | "dotted";

export interface BorderStyleDropdownProps {
  value: BorderStyle | undefined;
  onChange: (newValue: BorderStyle) => void;
  disabled?: boolean;
}

const BORDER_TYPE_OPTIONS: {
  [key in BorderStyle]: {
    icon: React.ReactElement;
    name: string;
  };
} = {
  ["none"]: {
    icon: <IconBorderStyle color={"#ccc"} />,
    name: "None",
  },
  ["solid"]: {
    icon: <IconBorderStyleSolid />,
    name: "Solid",
  },
  ["dashed"]: {
    icon: <IconBorderStyleDashed />,
    name: "Dashes",
  },
  ["dotted"]: {
    icon: <IconBorderStyleDotted />,
    name: "Dots",
  },
};

export function BorderStyleDropdown({ value, onChange, disabled = false }: BorderStyleDropdownProps) {
  if (!value) {
    value = "none";
  }
  const option = BORDER_TYPE_OPTIONS[value] ?? BORDER_TYPE_OPTIONS["none"];
  return (
    <DropDown disabled={disabled} buttonLabel={option.name} buttonIcon={option.icon} buttonAriaLabel="Border">
      {Object.keys(BORDER_TYPE_OPTIONS).map((borderStyleString) => {
        const borderStyle = borderStyleString as BorderStyle;
        const option = BORDER_TYPE_OPTIONS[borderStyle];
        return (
          <DropDownItem
            key={borderStyle}
            onClick={onChange.bind(undefined, borderStyle)}
            active={value === borderStyle}
          >
            {option.icon} <OptionalText>{option.name}</OptionalText>
          </DropDownItem>
        );
      })}
    </DropDown>
  );
}
