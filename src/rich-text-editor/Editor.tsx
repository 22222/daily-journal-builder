/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import { AutoFocusPlugin } from "@lexical/react/LexicalAutoFocusPlugin";
import { ClearEditorPlugin } from "@lexical/react/LexicalClearEditorPlugin";
import React from "react";

import LexicalErrorBoundary from "@lexical/react/LexicalErrorBoundary";
import { HistoryPlugin } from "@lexical/react/LexicalHistoryPlugin";
import { RichTextPlugin } from "@lexical/react/LexicalRichTextPlugin";
import { LayoutPlugin } from "./plugins/LayoutPlugin";
import { TabFocusPlugin } from "./plugins/TabFocusPlugin";
import { ToolbarPlugin } from "./plugins/ToolbarPlugin";
import { ContentEditable } from "@lexical/react/LexicalContentEditable";

export interface EditorProps {
  contentEditableStyle?: React.CSSProperties;
}

export function Editor({ contentEditableStyle }: EditorProps): JSX.Element {
  const [isSmallWidthViewport, setIsSmallWidthViewport] = React.useState<boolean>(false);
  React.useEffect(() => {
    const updateViewPortWidth = () => {
      const isNextSmallWidthViewport = window.matchMedia("(max-width: 1025px)").matches;
      if (isNextSmallWidthViewport !== isSmallWidthViewport) {
        setIsSmallWidthViewport(isNextSmallWidthViewport);
      }
    };
    updateViewPortWidth();
    window.addEventListener("resize", updateViewPortWidth);
    return () => {
      window.removeEventListener("resize", updateViewPortWidth);
    };
  }, [isSmallWidthViewport]);

  return (
    <>
      <ToolbarPlugin />
      <div
        className="editor-container"
        style={{
          position: "relative",
          display: "block",
        }}
      >
        <AutoFocusPlugin />
        <ClearEditorPlugin />
        <HistoryPlugin />
        <RichTextPlugin
          contentEditable={
            <div className="editor">
              <ContentEditable style={contentEditableStyle} />
            </div>
          }
          placeholder={null}
          // placeholder={
          //   <div
          //     style={{
          //       fontSize: "15px",
          //       color: "#999",
          //       overflow: "hidden",
          //       position: "absolute",
          //       textOverflow: "ellipsis",
          //       top: "8px",
          //       left: "8px",
          //       right: "28px",
          //       userSelect: "none",
          //       whiteSpace: "nowrap",
          //       display: "inline-block",
          //       pointerEvents: "none",
          //     }}
          //   >
          //     Enter some rich text...
          //   </div>
          // }
          ErrorBoundary={LexicalErrorBoundary}
        />
        <TabFocusPlugin />
        <LayoutPlugin />
      </div>
    </>
  );
}
