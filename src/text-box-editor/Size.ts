import type { LengthValue } from "../LengthValue";
import { convertLengthValueToPxOrUndefined, convertLengthValueToInchesStringOrUndefined } from "../LengthValue";

export type Size = 0 | 1 | 2 | 3 | 4 | 5;

export function convertSizeToPxOrUndefined(value: unknown): number | undefined {
  //1 = 4px, 2 = 8px, 3 = 16px, 4 = 24px, 5 = 48px
  if (value === 0) return 0;
  if (value === 1) return 4;
  if (value === 2) return 8;
  if (value === 3) return 16;
  if (value === 4) return 24;
  if (value === 5) return 48;
  return undefined;
}

export function convertSizeToInchesStringOrUndefined(value: unknown): `${number}in` | "0" | undefined {
  return convertLengthValueToInchesStringOrUndefined(convertSizeToPxOrUndefined(value));
}

export function convertLengthValueToSizeOrUndefined(value: unknown): Size | undefined {
  const px = convertLengthValueToPxOrUndefined(value);
  if (!px || px < 0) {
    return undefined;
  }

  let size: Size;
  if (px < 1) {
    size = 0;
  } else if (px < 5) {
    size = 1;
  } else if (px < 9) {
    size = 2;
  } else if (px < 17) {
    size = 3;
  } else if (px < 25) {
    size = 4;
  } else {
    size = 5;
  }
  return size;
}
