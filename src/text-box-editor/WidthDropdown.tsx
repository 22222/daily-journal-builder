import React from "react";
import { IconSquare } from "../icons";
import { DropDown, DropDownItem } from "../ui/DropDown";
import { OptionalText } from "../ui/OptionalText";
import type { WidthType } from "./WidthType";

export interface WidthDropdownProps {
  value: WidthType | undefined;
  onChange: (newValue: WidthType) => void;
  disabled?: boolean;
}

const WIDTH_OPTIONS: {
  [key in WidthType]: {
    icon: React.ReactElement;
    name: string;
  };
} = {
  ["25%"]: {
    icon: <IconSquare />,
    name: "25%",
  },
  ["50%"]: {
    icon: <IconSquare aspectRatio="2:1" />,
    name: "50%",
  },
  ["75%"]: {
    icon: <IconSquare aspectRatio="3:1" />,
    name: "75%",
  },
  ["100%"]: {
    icon: <IconSquare aspectRatio="4:1" />,
    name: "100%",
  },
};

export function WidthDropdown({ value, onChange, disabled = false }: WidthDropdownProps) {
  if (!value) {
    value = "50%";
  }
  const option = WIDTH_OPTIONS[value];

  return (
    <DropDown disabled={disabled} buttonLabel={option.name} buttonIcon={option.icon} buttonAriaLabel="Width">
      {Object.keys(WIDTH_OPTIONS).map((widthString) => {
        const width = widthString as WidthType;
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
