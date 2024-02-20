import { expect, it, describe } from "vitest";
import { LayoutItem, buildLayout, Layout } from "../src/layoutBuilder";

describe("layoutBuilder", () => {
  it("should build expected sample", () => {
    const items: LayoutItem[] = [
      { key: "1", width: 800, height: 600 },
      { key: "2", width: 1024, height: 768 },
      { key: "3", width: 500, height: 500 },
    ];
    const width = 800;
    const height = 812;
    const actual = buildLayout(items, { layoutWidth: width, layoutHeight: height, gap: 5 });
    console.log(actual);
    const expected: Layout = {
      rows: [
        {
          width: 795,
          height: 296,
          cells: [
            {
              item: items[0],
              row: 1,
              order: 1,
              height: 296,
              width: 395,
            },
            {
              item: items[1],
              row: 1,
              order: 2,
              height: 296,
              width: 395,
            },
          ],
        },
        {
          width: 500,
          height: 500,
          cells: [
            {
              item: items[2],
              row: 2,
              order: 1,
              height: 500,
              width: 500,
            },
          ],
        },
      ],
      width,
      height,
    };
    expect(expected).toEqual(actual);
  });
});
