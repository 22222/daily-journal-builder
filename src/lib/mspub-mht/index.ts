export type TextBoxProps = {
  text: string;
  x: `${number}in` | `${number}mm` | `${number}px` | `${number}pt` | "0";
  y: `${number}in` | `${number}mm` | `${number}px` | `${number}pt` | "0";
  width: `${number}in` | `${number}mm` | `${number}px` | `${number}pt` | "0";
  height: `${number}in` | `${number}mm` | `${number}px` | `${number}pt` | "0";
  color?: string;
  backgroundColor?: string;
  fontSize?: number;
  fontFamily?: string;
  fontWeight?: "bold";
  textAlign?: "left" | "center" | "right" | "justify";
  border?: {
    width?: `${number}in` | `${number}mm` | `${number}px` | `${number}pt` | "0";
    style?: "solid" | "dotted" | "dashed";
    color?: string;
  };
};

export type ImageProps = {
  data: string;
  imageType: "jpeg" | "png" | "bmp" | undefined;
  title?: string;
  x: `${number}in` | `${number}mm` | `${number}px` | `${number}pt` | "0";
  y: `${number}in` | `${number}mm` | `${number}px` | `${number}pt` | "0";
  width: `${number}in` | `${number}mm` | `${number}px` | `${number}pt` | "0";
  height: `${number}in` | `${number}mm` | `${number}px` | `${number}pt` | "0";
};

function getImageExtension(img: ImageProps): string {
  if (img.imageType) {
    if (img.imageType === "jpeg") {
      return "jpg";
    }
    return img.imageType;
  }

  return "bin";
}

function getImageMimeType(img: ImageProps): string {
  if (img.imageType) {
    return `image/${img.imageType}`;
  }
  return "application/octet-stream";
}

export class MhtPublisherDocument {
  private textBoxes: TextBoxProps[] = [];
  private images: ImageProps[] = [];
  private randomSeed: number | undefined;

  addTextBox(props: TextBoxProps) {
    this.textBoxes.push(props);
  }

  addImage(props: ImageProps) {
    this.images.push(props);
  }

  setRandomSeed(seed: number) {
    this.randomSeed = seed;
  }

  private random() {
    if (this.randomSeed === undefined) return Math.random();
    this.randomSeed = (1664525 * this.randomSeed + 1013904223) % 4294967296;
    return this.randomSeed / 4294967296;
  }

  serializeToString(): string {
    // Generate a boundary string
    const boundaryId =
      this.random().toString(36).substring(2, 10).toUpperCase() +
      "." +
      this.random().toString(36).substring(2, 10).toUpperCase();
    const boundary = "----=_NextPart_" + boundaryId;
    const folder = this.random().toString(36).substring(2, 10).toUpperCase();

    // Helper to create Content-Location for images
    const imageFileNames = this.images.map(
      (img, i) => `image${(i + 1).toFixed(0).padStart(3, "0")}.${getImageExtension(img)}`,
    );

    // Main HTML part
    let html = `<html xmlns:v="urn:schemas-microsoft-com:vml"
xmlns:o="urn:schemas-microsoft-com:office:office"
xmlns:b="urn:schemas-microsoft-com:office:publisher"
xmlns="http://www.w3.org/TR/REC-html40">

<head>
<meta http-equiv=Content-Type content="text/html; charset=windows-1252">
<meta name=ProgId content=Publisher.Document>
<meta name=Generator content="Microsoft Publisher 15">
<link rel=File-List href="main_files/filelist.xml">
<xml>
 <o:DocumentProperties>
  <o:Version>16.00</o:Version>
 </o:DocumentProperties>
</xml>
</head>

<body bgcolor=white>

<div>
`;

    const shapeTypeId = "_x0000_t202";
    if (this.textBoxes.length > 0) {
      html += `
<v:shapetype id="${shapeTypeId}" path="m,l,21600r21600,l21600,xe"></v:shapetype>
`;
    }

    let itemBoxCounter = 0;

    // Add VML for textboxes
    this.textBoxes.forEach((tb, i) => {
      const shapeId = `_x0000_s${1025 + itemBoxCounter}`;
      const zIndex = itemBoxCounter + 1;
      itemBoxCounter++;

      const spanStyleParts: string[] = [];
      if (tb.fontSize) {
        spanStyleParts.push(`font-size:${tb.fontSize}pt`);
      }
      spanStyleParts.push("line-height:119%");
      if (tb.fontFamily) {
        spanStyleParts.push(`font-family:${tb.fontFamily}`);
      }
      if (tb.color) {
        spanStyleParts.push(`color:${tb.color}`);
      }
      if (tb.fontWeight === "bold") {
        spanStyleParts.push("font-weight:bold");
      }
      const spanStyle = spanStyleParts.join(";");

      const pStyleParts: string[] = [];
      if (tb.textAlign) {
        pStyleParts.push(`text-align:${tb.textAlign}`);
      }
      const pStyle = pStyleParts.join(";");

      const shapeAttributeParts: string[] = [];
      if (!tb.backgroundColor) {
        shapeAttributeParts.push('filled="f"');
      } else {
        shapeAttributeParts.push('filled="t"');

        const fillColor = tb.backgroundColor ?? "#5b9bd5";
        shapeAttributeParts.push(`fillcolor="${fillColor} [1]"`);
      }

      if (!tb.border) {
        shapeAttributeParts.push('stroked="f"');
      } else {
        shapeAttributeParts.push('stroked="t"');

        const strokeColor = tb.border?.color ?? "black";
        shapeAttributeParts.push(`strokecolor="${strokeColor} [0]"`);

        const strokeWeight = tb.border?.width ?? "2pt";
        shapeAttributeParts.push(` strokeweight="${strokeWeight}"`);
      }
      const shapeAttributes = shapeAttributeParts.join(" ");

      html += `
<v:shape id="${shapeId}" type="#${shapeTypeId}" style='position:absolute;left:${tb.x};top:${tb.y};width:${tb.width};height:${tb.height};z-index:${zIndex}'
 ${shapeAttributes}>
</v:shape>
<div v:shape="${shapeId}">
  <p class=MsoNormal style='${pStyle}'><span style='${spanStyle}'>${tb.text}</span></p>
</div>
`;
    });

    // Add VML for images
    this.images.forEach((img, i) => {
      const shapeId = `_x0000_s${1025 + itemBoxCounter}`;
      const zIndex = itemBoxCounter + 1;
      itemBoxCounter++;

      const imageName = `image${(i + 1).toFixed(0).padStart(3, "0")}.${getImageExtension(img)}`;

      html += `
<v:rect id="${shapeId}" style='position:absolute;left:${img.x};top:${img.y};width:${img.width};height:${img.height};z-index:${zIndex}' filled="f" stroked="f">
 <v:imagedata src="main_files/${imageName}" o:title="${img.title ?? ""}"/>
</v:rect>
`;
    });

    html += `
</div>

</body>

</html>
`;

    // Filelist.xml part
    let filelistXml = `<xml xmlns:o="urn:schemas-microsoft-com:office:office">
 <o:MainFile HRef="../main.htm"/>
`;
    imageFileNames.forEach((name) => {
      filelistXml += ` <o:File HRef="${name}"/>
`;
    });
    filelistXml += ` <o:File HRef="filelist.xml"/>
</xml>
`;

    // Build MHT parts
    let mht = `MIME-Version: 1.0`;
    mht += lineSeparator;
    mht += `Content-Type: multipart/related; boundary="${boundary}"`;
    mht += lineSeparator;
    mht += lineSeparator;
    mht += `This document is a Single File Web Page, also known as a Web Archive file.  If you are seeing this message, your browser or editor doesn't support Web Archive files.  Please download a browser that supports Web Archive, such as Windows� Internet Explorer�.`;
    mht += lineSeparator;
    mht += lineSeparator;

    // Main HTML part (quoted-printable encoding)
    const htmlQP = quotedPrintableEncode(html);
    mht += `--${boundary}`;
    mht += lineSeparator;
    mht += `Content-Location: file:///C:/${folder}/main.htm`;
    mht += lineSeparator;
    mht += `Content-Transfer-Encoding: quoted-printable`;
    mht += lineSeparator;
    mht += `Content-Type: text/html; charset="windows-1252"`;
    mht += lineSeparator;
    mht += lineSeparator;
    mht += `${htmlQP}`;
    mht += lineSeparator;
    mht += lineSeparator;

    // Image parts
    this.images.forEach((img, i) => {
      // Insert line breaks every 76 chars in base64
      const base64WithBreaks = img.data.replace(/(.{76})/g, "$1" + lineSeparator);
      mht += `--${boundary}`;
      mht += lineSeparator;
      mht += `Content-Location: file:///C:/${folder}/main_files/${imageFileNames[i]}`;
      mht += lineSeparator;
      mht += `Content-Transfer-Encoding: base64`;
      mht += lineSeparator;
      mht += `Content-Type: ${getImageMimeType(img)}`;
      mht += lineSeparator;
      mht += lineSeparator;
      mht += `${base64WithBreaks}`;
      mht += lineSeparator;
      mht += lineSeparator;
    });

    // Filelist.xml part (quoted-printable encoding)
    const filelistXmlQP = quotedPrintableEncode(filelistXml);
    mht += `--${boundary}`;
    mht += lineSeparator;
    mht += `Content-Location: file:///C:/${folder}/main_files/filelist.xml`;
    mht += lineSeparator;
    mht += `Content-Transfer-Encoding: quoted-printable`;
    mht += lineSeparator;
    mht += `Content-Type: text/xml; charset="utf-8"`;
    mht += lineSeparator;
    mht += lineSeparator;
    mht += `${filelistXmlQP}`;

    // End boundary
    mht += `--${boundary}--`;
    mht += lineSeparator;
    return mht;
  }
}

const lineSeparator = "\r\n";
function quotedPrintableEncode(str: string): string {
  let out = str.replace(/=/g, "=3D");
  out = quotedPrintableWrap(out);
  return out;
}

function quotedPrintableWrap(str: string, lineLength = 76) {
  str = (str || "").toString();
  lineLength = lineLength || 76;

  if (str.length <= lineLength) {
    return str;
  }

  const lines = str.split(/\r?\n/);
  const resultLines: string[] = [];
  for (const line of lines) {
    if (line.length <= lineLength) {
      resultLines.push(line);
      continue;
    }

    const LINE_LENGTH = 75;
    const lineChunks: string[] = [];
    for (let i = 0; i < line.length; i += LINE_LENGTH) {
      let chunk = line.substring(i, i + LINE_LENGTH);

      // If this line ends with `=`, optionally followed by a single uppercase
      // hexadecimal digit, we broke an escape sequence in half. Fix it by
      // moving these characters to the next line.
      const previousChunk = lineChunks[lineChunks.length - 1];
      if (previousChunk) {
        if (/=$/.test(chunk)) {
          chunk = chunk.slice(0, LINE_LENGTH - 1);
          lineChunks[lineChunks.length - 1] = previousChunk + chunk.slice(LINE_LENGTH - 1);
        } else if (/=[A-F0-9]$/.test(chunk)) {
          chunk = chunk.slice(0, LINE_LENGTH - 2);
          lineChunks[lineChunks.length - 1] = previousChunk + chunk.slice(LINE_LENGTH - 2);
        }
      }
      lineChunks.push(chunk);
    }

    resultLines.push(lineChunks.join("=\r\n"));
  }
  return resultLines.join("\r\n");
}
