/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { $patchStyleText } from "@lexical/selection";
import { $findMatchingParent, mergeRegister } from "@lexical/utils";
import {
  $getSelection,
  $isElementNode,
  $isRangeSelection,
  $isRootOrShadowRoot,
  CAN_REDO_COMMAND,
  CAN_UNDO_COMMAND,
  COMMAND_PRIORITY_CRITICAL,
  ElementFormatType,
  FORMAT_ELEMENT_COMMAND,
  FORMAT_TEXT_COMMAND,
  LexicalEditor,
  REDO_COMMAND,
  SELECTION_CHANGE_COMMAND,
  UNDO_COMMAND,
} from "lexical";
import React from "react";
import { INSERT_LAYOUT_COMMAND } from "./LayoutPlugin";

import { $isAtNodeEnd } from "@lexical/selection";
import { ElementNode, RangeSelection, TextNode } from "lexical";
import {
  IconArrowClockwise,
  IconArrowCounterclockwise,
  IconJustify,
  IconLayoutThreeColumns,
  IconTextCenter,
  IconTextLeft,
  IconTextRight,
  IconTypeBold,
  IconTypeItalic,
  IconTypeUnderline,
} from "../../icons";
import { FontFamilyDropDown } from "../../text-box-editor/FontFamilyDropDown";
import { DropDown, DropDownItem } from "../../ui/DropDown";
import { OptionalText } from "../../ui/OptionalText";

const IS_APPLE: boolean = /Mac|iPod|iPhone|iPad/.test(navigator.platform);

const FONT_FAMILY_OPTIONS: [string, string][] = [
  ["Arial", "Arial"],
  ["Courier New", "Courier New"],
  ["Georgia", "Georgia"],
  ["Times New Roman", "Times New Roman"],
  ["Trebuchet MS", "Trebuchet MS"],
  ["Verdana", "Verdana"],
];

const ELEMENT_FORMAT_OPTIONS: {
  [key in Exclude<ElementFormatType, "start" | "end" | "">]: {
    icon: React.ReactElement;
    name: string;
  };
} = {
  center: {
    icon: <IconTextCenter />,
    name: "Center Align",
  },
  justify: {
    icon: <IconJustify />,
    name: "Justify Align",
  },
  left: {
    icon: <IconTextLeft />,
    name: "Left Align",
  },
  right: {
    icon: <IconTextRight />,
    name: "Right Align",
  },
};

function getSelectedNode(selection: RangeSelection): TextNode | ElementNode {
  const anchor = selection.anchor;
  const focus = selection.focus;
  const anchorNode = selection.anchor.getNode();
  const focusNode = selection.focus.getNode();
  if (anchorNode === focusNode) {
    return anchorNode;
  }
  const isBackward = selection.isBackward();
  if (isBackward) {
    return $isAtNodeEnd(focus) ? anchorNode : focusNode;
  } else {
    return $isAtNodeEnd(anchor) ? anchorNode : focusNode;
  }
}

function EditorFontFamilyDropDown({
  editor,
  value,
  disabled = false,
}: {
  editor: LexicalEditor;
  value: string;
  disabled?: boolean;
}): JSX.Element {
  const handleClick = React.useCallback(
    (option: string) => {
      editor.update(() => {
        const selection = $getSelection();
        if (selection !== null) {
          $patchStyleText(selection, {
            ["font-family"]: option,
          });
        }
      });
    },
    [editor],
  );

  return (
    <FontFamilyDropDown
      options={FONT_FAMILY_OPTIONS.map(([option, text]) => ({ value: option, label: text }))}
      onClick={handleClick}
      value={value}
      disabled={disabled}
    />
  );
}

function ElementFormatDropdown({
  editor,
  value,
  disabled = false,
}: {
  editor: LexicalEditor;
  value: Exclude<ElementFormatType, "start" | "end" | "">;
  disabled: boolean;
}) {
  if (!value) {
    value = "left";
  }
  const formatOption = ELEMENT_FORMAT_OPTIONS[value];

  return (
    <DropDown
      disabled={disabled}
      buttonLabel={formatOption.name}
      buttonIcon={formatOption.icon}
      buttonClassName="toolbar-item alignment"
      buttonAriaLabel="Formatting options for text alignment"
    >
      <DropDownItem
        onClick={() => {
          editor.dispatchCommand(FORMAT_ELEMENT_COMMAND, "left");
        }}
        active={value === "left"}
      >
        <IconTextLeft /> <OptionalText>Left Align</OptionalText>
      </DropDownItem>
      <DropDownItem
        onClick={() => {
          editor.dispatchCommand(FORMAT_ELEMENT_COMMAND, "center");
        }}
        active={value === "center"}
      >
        <IconTextCenter /> <OptionalText>Center Align</OptionalText>
      </DropDownItem>
      <DropDownItem
        onClick={() => {
          editor.dispatchCommand(FORMAT_ELEMENT_COMMAND, "right");
        }}
        active={value === "right"}
      >
        <IconTextRight /> <OptionalText>Right Align</OptionalText>
      </DropDownItem>
      <DropDownItem
        onClick={() => {
          editor.dispatchCommand(FORMAT_ELEMENT_COMMAND, "justify");
        }}
        active={value === "justify"}
      >
        <IconJustify /> <OptionalText>Justify Align</OptionalText>
      </DropDownItem>
    </DropDown>
  );
}

export function ToolbarPlugin(): JSX.Element {
  const [editor] = useLexicalComposerContext();
  const [activeEditor, setActiveEditor] = React.useState(editor);
  // const [fontSize, setFontSize] = React.useState<string>("15px");
  // const [fontColor, setFontColor] = React.useState<string>("#000");
  // const [bgColor, setBgColor] = React.useState<string>("#fff");
  // const [fontFamily, setFontFamily] = React.useState<string>("Arial");
  const [elementFormat, setElementFormat] = React.useState<Exclude<ElementFormatType, "start" | "end" | "">>("left");
  const [isBold, setIsBold] = React.useState(false);
  const [isItalic, setIsItalic] = React.useState(false);
  const [isUnderline, setIsUnderline] = React.useState(false);
  const [canUndo, setCanUndo] = React.useState(false);
  const [canRedo, setCanRedo] = React.useState(false);
  const [isEditable, setIsEditable] = React.useState(() => editor.isEditable());

  const $updateToolbar = React.useCallback(() => {
    const selection = $getSelection();
    if ($isRangeSelection(selection)) {
      const anchorNode = selection.anchor.getNode();
      let element =
        anchorNode.getKey() === "root"
          ? anchorNode
          : $findMatchingParent(anchorNode, (e) => {
              const parent = e.getParent();
              return parent !== null && $isRootOrShadowRoot(parent);
            });

      if (element === null) {
        element = anchorNode.getTopLevelElementOrThrow();
      }

      // Update text format
      setIsBold(selection.hasFormat("bold"));
      setIsItalic(selection.hasFormat("italic"));
      setIsUnderline(selection.hasFormat("underline"));

      // Update links
      const node = getSelectedNode(selection);
      const parent = node.getParent();

      // // Handle buttons
      // setFontSize($getSelectionStyleValueForProperty(selection, "font-size", "15px"));
      // setFontColor($getSelectionStyleValueForProperty(selection, "color", "#000"));
      // setBgColor($getSelectionStyleValueForProperty(selection, "background-color", "#fff"));
      // setFontFamily($getSelectionStyleValueForProperty(selection, "font-family", "Arial"));

      // If matchingParent is a valid node, pass its format type
      const elementFormatOrUndefined = $isElementNode(node) ? node.getFormatType() : parent?.getFormatType();
      let elementFormat = elementFormatOrUndefined || "left";
      console.log("elementFormat", elementFormatOrUndefined, node, parent);
      if (elementFormat === "start") elementFormat = "left";
      if (elementFormat === "end") elementFormat = "right";
      setElementFormat(elementFormat);
    }
  }, [activeEditor]);

  React.useEffect(() => {
    return editor.registerCommand(
      SELECTION_CHANGE_COMMAND,
      (_payload, newEditor) => {
        $updateToolbar();
        setActiveEditor(newEditor);
        return false;
      },
      COMMAND_PRIORITY_CRITICAL,
    );
  }, [editor, $updateToolbar]);

  React.useEffect(() => {
    return mergeRegister(
      editor.registerEditableListener((editable) => {
        setIsEditable(editable);
      }),
      activeEditor.registerUpdateListener(({ editorState }) => {
        editorState.read(() => {
          $updateToolbar();
        });
      }),
      activeEditor.registerCommand<boolean>(
        CAN_UNDO_COMMAND,
        (payload) => {
          setCanUndo(payload);
          return false;
        },
        COMMAND_PRIORITY_CRITICAL,
      ),
      activeEditor.registerCommand<boolean>(
        CAN_REDO_COMMAND,
        (payload) => {
          setCanRedo(payload);
          return false;
        },
        COMMAND_PRIORITY_CRITICAL,
      ),
    );
  }, [$updateToolbar, activeEditor, editor]);

  const applyStyleText = React.useCallback(
    (styles: Record<string, string>, skipHistoryStack?: boolean) => {
      activeEditor.update(
        () => {
          const selection = $getSelection();
          if (selection !== null) {
            $patchStyleText(selection, styles);
          }
        },
        skipHistoryStack ? { tag: "historic" } : {},
      );
    },
    [activeEditor],
  );

  const onFontColorSelect = React.useCallback(
    (value: string, skipHistoryStack: boolean) => {
      applyStyleText({ color: value }, skipHistoryStack);
    },
    [applyStyleText],
  );

  const onBgColorSelect = React.useCallback(
    (value: string, skipHistoryStack: boolean) => {
      applyStyleText({ "background-color": value }, skipHistoryStack);
    },
    [applyStyleText],
  );

  return (
    <div className="btn-toolbar gap-1 mb-1">
      <div className="btn-group">
        <button
          className="btn btn-secondary"
          disabled={!canUndo || !isEditable}
          onClick={() => {
            activeEditor.dispatchCommand(UNDO_COMMAND, undefined);
          }}
          title={IS_APPLE ? "Undo (⌘Z)" : "Undo (Ctrl+Z)"}
          aria-label="Undo"
        >
          <IconArrowCounterclockwise className="format" />
        </button>
        <button
          className="btn btn-secondary"
          disabled={!canRedo || !isEditable}
          onClick={() => {
            activeEditor.dispatchCommand(REDO_COMMAND, undefined);
          }}
          title={IS_APPLE ? "Redo (⌘Y)" : "Redo (Ctrl+Y)"}
          aria-label="Redo"
        >
          <IconArrowClockwise className="format" />
        </button>
      </div>
      <div className="btn-group">
        <button
          className={"btn btn-secondary" + (isBold ? " active" : "")}
          disabled={!isEditable}
          onClick={() => {
            activeEditor.dispatchCommand(FORMAT_TEXT_COMMAND, "bold");
          }}
          title={IS_APPLE ? "Bold (⌘B)" : "Bold (Ctrl+B)"}
          aria-label={`Format text as bold. Shortcut: ${IS_APPLE ? "⌘B" : "Ctrl+B"}`}
        >
          <IconTypeBold className="format" />
        </button>
        <button
          className={"btn btn-secondary" + (isItalic ? " active" : "")}
          disabled={!isEditable}
          onClick={() => {
            activeEditor.dispatchCommand(FORMAT_TEXT_COMMAND, "italic");
          }}
          title={IS_APPLE ? "Italic (⌘I)" : "Italic (Ctrl+I)"}
          aria-label={`Format text as italics. Shortcut: ${IS_APPLE ? "⌘I" : "Ctrl+I"}`}
        >
          <IconTypeItalic className="format" />
        </button>
        <button
          className={"btn btn-secondary" + (isUnderline ? " active" : "")}
          disabled={!isEditable}
          onClick={() => {
            activeEditor.dispatchCommand(FORMAT_TEXT_COMMAND, "underline");
          }}
          title={IS_APPLE ? "Underline (⌘U)" : "Underline (Ctrl+U)"}
          aria-label={`Format text to underlined. Shortcut: ${IS_APPLE ? "⌘U" : "Ctrl+U"}`}
        >
          <IconTypeUnderline className="format" />
        </button>
      </div>
      {/* <div className="btn-group">
        <EditorFontFamilyDropDown disabled={!isEditable} value={fontFamily} editor={editor} />
      </div>
      <div className="btn-group">
        <EditorFontSize selectionFontSize={fontSize.slice(0, -2)} editor={editor} disabled={!isEditable} />
      </div>
      <div className="btn-group">
        <div className="btn-group">
          <DropdownColorPicker
            disabled={!isEditable}
            buttonClassName="btn toolbar-item color-picker"
            buttonAriaLabel="Formatting text color"
            buttonIcon={<IconFontColor />}
            color={fontColor}
            onChange={onFontColorSelect}
            title="text color"
          />
        </div>
        <div className="btn-group">
          <DropdownColorPicker
            disabled={!isEditable}
            buttonClassName="btn toolbar-item color-picker"
            buttonAriaLabel="Formatting background color"
            buttonIcon={<IconBgColor />}
            color={bgColor}
            onChange={onBgColorSelect}
            title="bg color"
          />
        </div>
      </div> */}
      <div className="btn-group">
        <ElementFormatDropdown disabled={!isEditable} value={elementFormat} editor={editor} />
      </div>
      <div className="btn-group">
        <button
          className="btn btn-secondary"
          disabled={!isEditable}
          onClick={() => {
            activeEditor.dispatchCommand(INSERT_LAYOUT_COMMAND, "1fr 1fr");
          }}
          title="Insert columns"
          aria-label="Insert column layout"
        >
          <IconLayoutThreeColumns className="format" /> <OptionalText>Columns</OptionalText>
        </button>
      </div>
    </div>
  );
}
