import React from "react";
import type { LengthValue } from "../LengthValue";
import type { TextBoxStyle } from "../TextBoxData";
import type { FontFace } from "../fonts/FontFace";
import { Editor } from "../rich-text-editor/Editor";
import { TextBoxToolbar } from "./TextBoxToolbar";

export interface TextBoxEditorProps {
  textBoxStyle: TextBoxStyle;
  setTextBoxStyle: (newStyle: TextBoxStyle) => void;
  pageWidth: LengthValue;
  fonts: FontFace[];
}

export function TextBoxEditor({ textBoxStyle, setTextBoxStyle, pageWidth, fonts }: TextBoxEditorProps) {
  return (
    <div className="d-flex flex-column gap-3">
      <TextBoxToolbar
        textBoxStyle={textBoxStyle}
        setTextBoxStyle={setTextBoxStyle}
        pageWidth={pageWidth}
        fonts={fonts}
      />
      <div className="editor-shell">
        <Editor
          contentEditableStyle={{
            position: "relative",
            outline: "0",
            border: "1px dotted #ccc",
            minHeight: "100px",
            ...textBoxStyle,
          }}
        />
      </div>
    </div>
  );
}
