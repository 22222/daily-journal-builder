import React from "react";
import { IconDash, IconPlus } from "../icons";
import type { Size } from "./Size";
import { generateUuid } from "../uuid";

export interface SizeInputProps {
  value: Size | undefined;
  minAllowedSize?: Size;
  maxAllowedSize?: Size;
  onChange: (newValue: Size) => void;
  label?: string;
  hideLabel?: boolean;
  disabled?: boolean;
}

export function SizeInput({
  value,
  minAllowedSize = 0,
  maxAllowedSize = 5,
  onChange,
  label,
  hideLabel,
  disabled,
}: SizeInputProps) {
  const [inputValue, setInputValue] = React.useState<Size | undefined>(value);

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (["e", "E", "+", "-"].includes(e.key)) {
      e.preventDefault();
      setInputValue(undefined);
      return;
    }

    if (e.key === "Enter") {
      e.preventDefault();

      if (inputValue === undefined) {
        return;
      }

      let updatedSize = inputValue;
      if (inputValue > maxAllowedSize) {
        updatedSize = maxAllowedSize;
      } else if (inputValue < minAllowedSize) {
        updatedSize = minAllowedSize;
      }
      setInputValue(updatedSize);
      onChange(updatedSize);
    }
  };

  const incrementSize = () => {
    let updatedSize = (inputValue ?? 0) + 1;
    if (updatedSize > maxAllowedSize) {
      updatedSize = maxAllowedSize;
    }
    setInputValue(updatedSize as Size);
    onChange(updatedSize as Size);
  };

  const decrementSize = () => {
    let updatedSize = (inputValue ?? 1) - 1;
    if (updatedSize < minAllowedSize) {
      updatedSize = minAllowedSize;
    }
    setInputValue(updatedSize as Size);
    onChange(updatedSize as Size);
  };

  React.useEffect(() => {
    setInputValue(value);
  }, [value]);

  const inputId = React.useMemo(() => `size-input-${generateUuid()}`, []);

  return (
    <div className="input-group">
      {label && (
        <label htmlFor={inputId} className={`input-group-text${hideLabel ? " visually-hidden" : ""}`}>
          {label}
        </label>
      )}
      <button
        type="button"
        className="btn btn-outline-secondary"
        disabled={disabled || (inputValue !== undefined && inputValue <= minAllowedSize)}
        onClick={decrementSize}
      >
        <IconDash className="format" />
      </button>
      <input
        type="text"
        inputMode="numeric"
        pattern="[0-9]*"
        value={inputValue}
        disabled={disabled}
        className="form-control"
        min={minAllowedSize}
        max={maxAllowedSize}
        size={1}
        maxLength={1}
        step={1}
        onChange={(e) => setInputValue(toSize(e.target.value))}
        onKeyDown={handleKeyPress}
        style={{ width: "4ch" }}
        id={inputId}
      />
      <button
        type="button"
        className="btn btn-outline-secondary"
        disabled={disabled || (inputValue !== undefined && inputValue >= maxAllowedSize)}
        onClick={incrementSize}
      >
        <IconPlus />
      </button>
    </div>
  );
}

function toSize(value: number | string | null | undefined): Size | undefined {
  if (value === undefined || value === null) {
    return undefined;
  }
  if (typeof value === "string") {
    value = parseInt(value, 10);
  }
  if (isNaN(value) || !isFinite(value)) {
    return undefined;
  }

  value = value | 0;
  if (value < 0 || value > 5) {
    return undefined;
  }
  return value as Size;
}
