import React from "react";
import { createPortal } from "react-dom";
import type { FontFace } from "./FontFace";

export interface WebFontsProps {
  fonts: FontFace[];
  prefix?: string | undefined;
}

export function WebFonts({ fonts, prefix = "" }: WebFontsProps) {
  const styleContent = React.useMemo(() => {
    const sb: string[] = [];
    for (const font of fonts) {
      sb.push(`@font-face {
font-family: '${prefix}${font.fontFamily}';
font-weight: ${font.fontWeight ?? "normal"};
font-style: ${font.fontStyle ?? "normal"};
font-display: swap;
src: url(data:font/ttf;base64,${font.base64}) format('truetype');
}`);
    }
    return sb.join("\n");
  }, [fonts, prefix]);

  return createPortal(
    <style
      dangerouslySetInnerHTML={{
        __html: styleContent,
      }}
    />,
    document.head,
  );
}
