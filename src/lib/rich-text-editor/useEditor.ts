import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import type {
  EditorState as LexicalEditorState,
  SerializedEditorState as LexicalSerializedEditorState,
  SerializedLexicalNode,
  RootNode,
} from "lexical";

export interface Editor {
  /**
   * Gets the active editor state.
   */
  getEditorState(): EditorState;
}

export type EditorState = LexicalEditorState;

export function useEditor(): Editor {
  const [lexicalEditor] = useLexicalComposerContext();
  return lexicalEditor;
}
