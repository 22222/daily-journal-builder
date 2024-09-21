import type { LengthValue } from "../LengthValue";
import { convertLengthValueToPxOrUndefined } from "../LengthValue";

// export type WidthType = "25%" | "50%" | "75%" | "100%";

// export function convertWidthTypeToLengthValue(
//   widthType: WidthType | `${number}%` | undefined,
//   pageWidthPx: number | undefined,
// ): number | undefined {
//   if (typeof widthType !== "string") {
//     return undefined;
//   }
//   //const pageWidthPx = convertLengthValueToPxOrUndefined(pageWidthPx);
//   if (!pageWidthPx) {
//     return undefined;
//   }

//   const percentMatch = widthType.trim().match(/^([0-9.]+)%$/i);
//   if (!percentMatch) {
//     return undefined;
//   }

//   const percent = parseInt(percentMatch[1], 10) / 100;
//   const width = (pageWidthPx * percent) | 0;
//   return width;
// }

// export function convertLengthValueToWidthType(width: unknown, pageWidthPx: number | undefined): WidthType | undefined {
//   const widthPx = convertLengthValueToPxOrUndefined(width);
//   //const pageWidthPx = convertLengthValueToPxOrUndefined(pageWidthPx);
//   if (!widthPx || !pageWidthPx) {
//     return undefined;
//   }

//   const percent = widthPx / pageWidthPx;
//   const roundedPercent = Math.round(percent * 4) / 4;
//   let widthType: WidthType;
//   if (roundedPercent <= 0.26) {
//     widthType = "25%";
//   } else if (roundedPercent <= 0.51) {
//     widthType = "50%";
//   } else if (roundedPercent <= 0.76) {
//     widthType = "75%";
//   } else {
//     widthType = "100%";
//   }
//   return widthType;
// }

export type SimpleWidthType = "sm" | "md" | "lg";

export function convertSimpleWidthTypeToLengthValue(
  widthType: SimpleWidthType | `${number}%` | undefined,
  pageWidthPx: number | undefined,
): number | undefined {
  if (typeof widthType !== "string") {
    return undefined;
  }
  if (!pageWidthPx) {
    return undefined;
  }

  let percent: number | undefined;
  if (widthType === "lg") {
    percent = 1;
  } else if (widthType === "md") {
    percent = 0.75;
  } else if (widthType === "sm") {
    percent = 0.5;
  } else {
    const percentMatch = widthType.trim().match(/^([0-9.]+)%$/i);
    if (!percentMatch) {
      return undefined;
    }
    percent = parseInt(percentMatch[1], 10) / 100;
  }
  const width = (pageWidthPx * percent) | 0;
  return width;
}

export function convertLengthValueToSimpleWidthType(
  width: unknown,
  pageWidthPx: number | undefined,
): SimpleWidthType | undefined {
  const widthPx = convertLengthValueToPxOrUndefined(width);
  if (!widthPx || !pageWidthPx) {
    return undefined;
  }

  const percent = widthPx / pageWidthPx;
  const roundedPercent = Math.round(percent * 4) / 4;
  let widthType: SimpleWidthType;
  if (roundedPercent <= 0.51) {
    widthType = "sm";
  } else if (roundedPercent <= 0.76) {
    widthType = "md";
  } else {
    widthType = "lg";
  }
  return widthType;
}
