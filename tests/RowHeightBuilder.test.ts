import { expect, it, describe } from "vitest";
import { RowHeightBuilder } from "../src/lib/layoutBuilder";

describe("RowHeightBuilder", () => {
  it("should build height for sample", () => {
    const rb = new RowHeightBuilder(5);
    rb.addItem(1024, 768, false);
    rb.addItem(500, 500, false);
    rb.addItem(800, 600, false);

    expect(rb.buildRowHeightForWidth(800)).toBeCloseTo(214.091, 2);
    expect(rb.buildRowHeightForWidth(1024)).toBeCloseTo(275.182, 2);
    expect(rb.buildRowHeightForWidth(9999)).toBeCloseTo(500, 2);
  });

  it("should build height for sample after reset", () => {
    const rb = new RowHeightBuilder(5);

    rb.addItem(816, 68, true);
    expect(rb.buildRowHeightForWidth(768)).toBeCloseTo(63.58, 2);

    rb.reset();
    rb.addItem(4608, 3072, false);
    rb.addItem(6120, 4080, false);
    rb.addItem(3072, 2048, false);

    // Getting 182?
    expect(rb.buildRowHeightForWidth(768)).toBeCloseTo(167.33, 2);

    rb.reset();
    rb.addItem(4608, 3072, false);
    rb.addItem(3072, 2048, false);
    rb.addItem(6120, 4080, false);

    // Getting 250?
    expect(rb.buildRowHeightForWidth(768)).toBeCloseTo(167.33, 2);
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
