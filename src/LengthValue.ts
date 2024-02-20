export type LengthValue = number | `${number}` | `${number}px` | `${number}in` | `${number}cm` | `${number}pt`;

const dpi = 96;

export function convertLengthValueToPx(value: LengthValue): number {
  const result = convertLengthValueToPxOrUndefined(value);
  if (typeof result !== "number") {
    throw new Error("Missing required length value");
  }
  return result;
}

export function convertLengthValueToPxOrUndefined(value: unknown): number | undefined {
  if (typeof value === "number") {
    if (isNaN(value) || !isFinite(value)) {
      return undefined;
    }
    return value;
  }

  if (typeof value !== "string") {
    return undefined;
  }

  const match = value.trim().match(/^([+-]?[0-9.]+)(px|in|cm|pt)?$/i);
  if (!match) {
    return undefined;
  }

  const valueNum = match[1].includes(".") ? parseFloat(match[1]) : parseInt(match[1], 10);
  const unit = match[2]?.toLowerCase() ?? "";
  let px: number | undefined;
  switch (unit) {
    case "px":
    case "":
      px = valueNum;
      break;
    case "in":
      px = (valueNum * dpi) | 0;
      break;
    case "cm":
      px = ((valueNum * dpi) / 2.54) | 0;
      break;
    case "pt":
      px = (valueNum * dpi) / 72;
      break;
  }
  return px;
}

export function convertLengthValueToInchesString(value: unknown): `${number}in` | "0" {
  const result = convertLengthValueToInchesStringOrUndefined(value);
  if (typeof result !== "string") {
    throw new Error("Missing required length value");
  }
  return result;
}

export function convertLengthValueToInchesStringOrUndefined(value: unknown): `${number}in` | "0" | undefined {
  if (typeof value === "number") {
    if (isNaN(value) || !isFinite(value)) {
      return undefined;
    }
    return convertPxToInchesString(value);
  }

  if (typeof value !== "string") {
    return undefined;
  }

  if (/^([+-]?[0-9.]+)in$/i.test(value)) {
    return value as `${number}in`;
  }

  const px = convertLengthValueToPxOrUndefined(value);
  if (typeof px !== "number") {
    return undefined;
  }
  return convertPxToInchesString(px);
}

function convertPxToInchesString(px: number): `${number}in` | "0" {
  if (px === 0) {
    return "0";
  }
  return `${Number((px / dpi).toFixed(5))}in` as `${number}in`;
}

export function convertLengthValueToPt(value: LengthValue): number {
  const result = convertLengthValueToPtOrUndefined(value);
  if (typeof result !== "number") {
    throw new Error("Missing required length value");
  }
  return result;
}

export function convertLengthValueToPtOrUndefined(value: unknown): number | undefined {
  if (typeof value === "number") {
    if (isNaN(value) || !isFinite(value)) {
      return undefined;
    }
    return (72 * value) / dpi;
  }

  if (typeof value !== "string") {
    return undefined;
  }

  const match = value.trim().match(/^([+-]?[0-9.]+)(px|pt)?$/i);
  if (!match) {
    return undefined;
  }

  const valueNum = match[1].includes(".") ? parseFloat(match[1]) : parseInt(match[1], 10);
  const unit = match[2]?.toLowerCase() ?? "";
  let pt: number | undefined;
  switch (unit) {
    case "px":
    case "":
      pt = (72 * valueNum) / dpi;
      break;
    case "pt":
      pt = valueNum;
      break;
  }
  return pt;
}

export function convertLengthValueToPtStringOrUndefined(value: unknown): `${number}pt` | undefined {
  const pt = convertLengthValueToPtOrUndefined(value);
  if (typeof pt !== "number") {
    return undefined;
  }
  return `${pt}pt`;
}
