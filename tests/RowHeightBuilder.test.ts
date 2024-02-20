import { expect, it, describe } from "vitest";
import { RowHeightBuilder } from "../src/layoutBuilder";

describe("RowHeightBuilder", () => {
  it("should build height for sample", () => {
    const rb = new RowHeightBuilder(5);
    rb.addItem(1024, 768);
    rb.addItem(500, 500);
    rb.addItem(800, 600);

    expect(rb.buildRowHeightForWidth(800)).toBeCloseTo(214.091, 2);
    expect(rb.buildRowHeightForWidth(1024)).toBeCloseTo(275.182, 2);
    expect(rb.buildRowHeightForWidth(9999)).toBeCloseTo(500, 2);
  });

//   it("should build height for sample with spans", () => {
//     const rb = new RowHeightBuilder(5);
//     rb.addItem(1024, 768);
//     rb.addItem(500, 500, 2);
//     rb.addItem(800, 600);

//     expect(rb.buildRowHeightForWidth(800)).toBeCloseTo(214.091, 2);
//     expect(rb.buildRowHeightForWidth(1024)).toBeCloseTo(275.182, 2);
//     expect(rb.buildRowHeightForWidth(9999)).toBeCloseTo(500, 2);
//   });
});
