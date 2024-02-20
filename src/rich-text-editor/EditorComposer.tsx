import { InitialConfigType, LexicalComposer, InitialEditorStateType } from "@lexical/react/LexicalComposer";

import React from "react";
import { LayoutContainerNode } from "./nodes/LayoutContainerNode";
import { LayoutItemNode } from "./nodes/LayoutItemNode";
import { theme } from "./RichTextEditorTheme";

export function EditorComposer({
  initialEditorState: editorState,
  children,
}: {
  initialEditorState?: InitialEditorStateType;
  children: React.ReactNode;
}): JSX.Element {
  const initialConfig: InitialConfigType = {
    editorState,
    namespace: "RichTextEditor",
    nodes: [LayoutContainerNode, LayoutItemNode],
    onError: (error: Error) => {
      throw error;
    },
    theme: theme,
  };
  return <LexicalComposer initialConfig={initialConfig}>{children}</LexicalComposer>;
}
