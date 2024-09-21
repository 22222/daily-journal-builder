import { describe, it, expect } from "vitest";
import * as fs from "fs";
import * as path from "path";
import { MhtPublisherDocument } from ".";

describe("pub mht files", () => {
  it("can generate a minimal .mht file with an image", async () => {
    const expectedPath = path.join(__dirname, "samples/green_expected.mht");
    expect(fs.existsSync(expectedPath)).toBe(true);
    const expected = fs.readFileSync(expectedPath, "utf-8");

    const actualDocument = new MhtPublisherDocument();
    actualDocument.setRandomSeed(12345);

    actualDocument.addTextBox({
      //   x: "3.66in",
      //   y: "1.81in",
      //   width: "1.33in",
      //   height: "1.33in",
      x: "275.4pt",
      y: "227.18pt",
      width: "1in",
      height: "36.49pt",
      text: "Green",
      //fontSize: 16,
      //fontFamily: "Arial",
      textAlign: "center",
    });

    actualDocument.addImage({
      //   x: "3.83in",
      //   y: "3.16in",
      //   width: "1in",
      //   height: ".51in",
      x: "263.39pt",
      y: "130.2pt",
      width: "96.01pt",
      height: "96.01pt",
      imageType: "png",
      data: "iVBORw0KGgoAAAANSUhEUgAAAIAAAACAAQMAAAD58POIAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAJcEhZcwAADsMAAA7DAcdvqGQAAAAWdEVYdFNvZnR3YXJlAHBhaW50Lm5ldCA0LjFM78X/AAAAA1BMVEUA/wA0XsCoAAAAGUlEQVRIx2NgGAWjYBSMglEwCkbBKKAvAAAIgAABbisdVAAAAABJRU5ErkJggg==",
      title: "green",
    });

    const actual = actualDocument.serializeToString();
    //fs.writeFileSync(path.join(__dirname, "samples/temp_green.mht"), actual, "utf-8");
    expect(actual).toBe(expected);
  });

  it("can generate an .mht file with several text boxes", async () => {
    const expectedPath = path.join(__dirname, "samples/corners_expected.mht");
    expect(fs.existsSync(expectedPath)).toBe(true);
    const expected = fs.readFileSync(expectedPath, "utf-8");

    const actualDocument = new MhtPublisherDocument();
    actualDocument.setRandomSeed(12345);

    actualDocument.addTextBox({
      //   x: ".5in",
      //   y: ".49in",
      //   width: "1in",
      //   height: "1in",
      x: "36pt",
      y: "35.02pt",
      width: "1in",
      height: "1in",
      text: "NW",
      fontFamily: "Calibri",
      fontSize: 10,
      color: "#0070C0",
    });
    actualDocument.addTextBox({
      x: "7in",
      y: ".51in",
      width: "1in",
      height: "1in",
      text: "NE",
      fontFamily: "Calibri",
      fontSize: 10,
    });
    actualDocument.addTextBox({
      x: ".5in",
      y: "10in",
      width: "1in",
      height: ".5in",
      text: "SW",
      fontFamily: "Calibri",
      fontSize: 10,
      color: "white",
      backgroundColor: "black",
    });
    actualDocument.addTextBox({
      x: "7.5in",
      y: "9.5in",
      width: ".5in",
      height: "1in",
      text: "SE",
      fontFamily: "Calibri",
      fontSize: 10,
    });

    const actual = actualDocument.serializeToString();
    //fs.writeFileSync(path.join(__dirname, "samples/temp_corners.mht"), actual, "utf-8");
    expect(actual).toBe(expected);
  });
});
