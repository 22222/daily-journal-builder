/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

// const basicColors: Array<`#${string}`> = [
//   "#d0021b",
//   "#f5a623",
//   "#f8e71c",
//   "#8b572a",
//   "#7ed321",
//   "#417505",
//   "#bd10e0",
//   "#9013fe",
//   "#4a90e2",
//   "#50e3c2",
//   "#b8e986",
//   "#000000",
//   "#4a4a4a",
//   "#9b9b9b",
//   "#ffffff",
// ];

export const basicColors: ReadonlyArray<`#${string}`> = Object.freeze([
  "#ffffff", // White
  "#c0c0c0", // Silver
  "#808080", // Gray
  "#000000", // Black
  "#ff0000", // Red
  "#800000", // Maroon
  "#ffff00", // Yellow
  "#ffc000", // (Orange)
  // Olive
  "#00ff00", // Lime
  "#008000", // Green
  "#00ffff", // Aqua
  "#008080", // Teal
  "#0000ff", // Blue
  // Navy
  // Fuchsia
  "#ffc0cb", // (Pink)
  "#ff69b4", // (Hot Pink)
  "#800080", // Purple
]);

export function getRandomBasicColor(): `#${string}` {
  const index = Math.floor(Math.random() * basicColors.length);
  return basicColors[index];
}
