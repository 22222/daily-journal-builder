import { expect, it, describe } from "vitest";
import { LayoutItem, buildLayout, Layout } from "../src/lib/layoutBuilder";

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
    //console.log(actual);
    const expected: Layout = {
      cells: [
        {
          item: items[0],
          row: 1,
          order: 1,
          height: 296,
          width: 395,
          left: 0,
          top: 0,
        },
        {
          item: items[1],
          row: 1,
          order: 2,
          height: 296,
          width: 395,
          left: 400,
          top: 0,
        },
        {
          item: items[2],
          row: 2,
          order: 1,
          height: 500,
          width: 500,
          left: 0,
          top: 301.25,
        },
      ],
      rows: [
        {
          width: 795,
          height: 296,
          top: 0,
          cells: [
            {
              item: items[0],
              row: 1,
              order: 1,
              height: 296,
              width: 395,
              left: 0,
              top: 0,
            },
            {
              item: items[1],
              row: 1,
              order: 2,
              height: 296,
              width: 395,
              left: 400,
              top: 0,
            },
          ],
        },
        {
          width: 500,
          height: 500,
          top: 301.25,
          cells: [
            {
              item: items[2],
              row: 2,
              order: 1,
              height: 500,
              width: 500,
              left: 0,
              top: 301.25,
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
