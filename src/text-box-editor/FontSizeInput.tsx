/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import React from "react";
import { IconPlus, IconDash } from "../icons";

const MIN_ALLOWED_FONT_SIZE = 8;
const MAX_ALLOWED_FONT_SIZE = 96;

enum UpdateFontSizeType {
  increment = 1,
  decrement,
}

export interface FontSizeInputProps {
  value: number | string | undefined;
  onChange: (newFontSize: `${number}pt` | undefined, updateType?: UpdateFontSizeType) => void;
  disabled?: boolean;
  minAllowedFontSize?: number;
  maxAllowedFontSize?: number;
}

export function FontSizeInput({
  value,
  onChange,
  disabled,
  minAllowedFontSize = MIN_ALLOWED_FONT_SIZE,
  maxAllowedFontSize = MAX_ALLOWED_FONT_SIZE,
}: FontSizeInputProps) {
  // const inputValue = React.useMemo(() => {
  //   return toInteger(value);
  // }, [value]);
  // const setInputValue = (newInputValue: number | undefined) => {
  //   onChange(toFontSize(newInputValue), undefined);
  // };

  const [inputValue, setInputValue] = React.useState<number | undefined>(toInteger(value));

  /**
   * Calculates the new font size based on the update type.
   * @param currentFontSize - The current font size
   * @param updateType - The type of change, either increment or decrement
   * @returns the next font size
   */
  const calculateNextFontSize = (currentFontSize: number, updateType: UpdateFontSizeType | null) => {
    if (!updateType) {
      return currentFontSize;
    }

    let updatedFontSize: number = currentFontSize;
    switch (updateType) {
      case UpdateFontSizeType.decrement:
        switch (true) {
          case currentFontSize > maxAllowedFontSize:
            updatedFontSize = maxAllowedFontSize;
            break;
          case currentFontSize >= 48:
            updatedFontSize -= 12;
            break;
          case currentFontSize >= 24:
            updatedFontSize -= 4;
            break;
          case currentFontSize >= 14:
            updatedFontSize -= 2;
            break;
          case currentFontSize >= 9:
            updatedFontSize -= 1;
            break;
          default:
            updatedFontSize = minAllowedFontSize;
            break;
        }
        break;

      case UpdateFontSizeType.increment:
        switch (true) {
          case currentFontSize < minAllowedFontSize:
            updatedFontSize = minAllowedFontSize;
            break;
          case currentFontSize < 12:
            updatedFontSize += 1;
            break;
          case currentFontSize < 20:
            updatedFontSize += 2;
            break;
          case currentFontSize < 36:
            updatedFontSize += 4;
            break;
          case currentFontSize <= 60:
            updatedFontSize += 12;
            break;
          default:
            updatedFontSize = maxAllowedFontSize;
            break;
        }
        break;

      default:
        break;
    }
    return updatedFontSize;
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    const inputValueNumber = inputValue;

    if (["e", "E", "+", "-"].includes(e.key)) {
      e.preventDefault();
      setInputValue(undefined);
      return;
    }

    if (e.key === "Enter") {
      e.preventDefault();

      if (inputValueNumber === undefined) {
        return;
      }

      let updatedFontSize = inputValueNumber;
      if (inputValueNumber > maxAllowedFontSize) {
        updatedFontSize = maxAllowedFontSize;
      } else if (inputValueNumber < minAllowedFontSize) {
        updatedFontSize = minAllowedFontSize;
      }
      setInputValue(updatedFontSize);
      onChange(toFontSize(updatedFontSize), undefined);
    }
  };

  const handleButtonClick = (updateType: UpdateFontSizeType) => {
    if (inputValue !== undefined) {
      const nextFontSize = calculateNextFontSize(inputValue, updateType);
      onChange(toFontSize(nextFontSize), undefined);
    } else {
      onChange(undefined, updateType);
    }
  };

  React.useEffect(() => {
    setInputValue(toInteger(value));
  }, [value]);

  return (
    <div className="input-group">
      <button
        type="button"
        className="btn btn-outline-secondary"
        disabled={disabled || (inputValue !== undefined && inputValue <= minAllowedFontSize)}
        onClick={() => handleButtonClick(UpdateFontSizeType.decrement)}
      >
        <IconDash className="format" />
      </button>
      <input
        type="number"
        inputMode="numeric"
        pattern="[0-9]*"
        value={inputValue}
        disabled={disabled}
        className="form-control"
        min={minAllowedFontSize}
        max={maxAllowedFontSize}
        size={2}
        maxLength={2}
        step={1}
        onChange={(e) => setInputValue(toInteger(e.target.value))}
        onKeyDown={handleKeyPress}
      />
      <button
        type="button"
        className="btn btn-outline-secondary"
        disabled={disabled || (inputValue !== undefined && inputValue >= maxAllowedFontSize)}
        onClick={() => handleButtonClick(UpdateFontSizeType.increment)}
      >
        <IconPlus />
      </button>
    </div>
  );
}

function toInteger(value: number | string | null | undefined): number | undefined {
  if (value === undefined || value === null) {
    return undefined;
  }
  if (typeof value === "string") {
    value = parseInt(value, 10);
  }
  if (isNaN(value) || !isFinite(value)) {
    return undefined;
  }
  return value | 0;
}

function toFontSize(value: number | undefined): `${number}pt` | undefined {
  if (!value) {
    return undefined;
  }
  return `${value}pt`;
}
