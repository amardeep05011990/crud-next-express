"use client";

import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import {
  FORMAT_TEXT_COMMAND,
  FORMAT_ELEMENT_COMMAND,
  UNDO_COMMAND,
  REDO_COMMAND,
} from "lexical";
import { $getSelection, $isRangeSelection } from "lexical";
import { HeadingNode } from "@lexical/rich-text";
import { $setBlocksType } from "@lexical/selection"; // ✅ Import $setBlocksType
import {
  INSERT_UNORDERED_LIST_COMMAND,
  INSERT_ORDERED_LIST_COMMAND,
} from "@lexical/list";
import { Button, ButtonGroup } from "@mui/material";

export function Toolbar() {
  const [editor] = useLexicalComposerContext();

  // ✅ Fix: Wrap existing text inside heading instead of replacing it
  const applyHeading = (level) => {
    editor.update(() => {
      const selection = $getSelection();
      if ($isRangeSelection(selection)) {
        $setBlocksType(selection, () => new HeadingNode(level)); // ✅ Properly convert text to heading
      }
    });
  };

  return (
    <div className="toolbar">
      <ButtonGroup variant="contained">
        {/* Undo & Redo */}
        <Button onClick={() => editor.dispatchCommand(UNDO_COMMAND, undefined)}>↺ Undo</Button>
        <Button onClick={() => editor.dispatchCommand(REDO_COMMAND, undefined)}>↻ Redo</Button>

        {/* Text Formatting */}
        <Button onClick={() => editor.dispatchCommand(FORMAT_TEXT_COMMAND, "bold")}>B</Button>
        <Button onClick={() => editor.dispatchCommand(FORMAT_TEXT_COMMAND, "italic")}>I</Button>
        <Button onClick={() => editor.dispatchCommand(FORMAT_TEXT_COMMAND, "underline")}>U</Button>
        <Button onClick={() => editor.dispatchCommand(FORMAT_TEXT_COMMAND, "code")}>{"</>"}</Button>

        {/* Headings (Fixed) */}
        <Button onClick={() => applyHeading("h1")}>H1</Button>
        <Button onClick={() => applyHeading("h2")}>H2</Button>
        <Button onClick={() => applyHeading("h3")}>H3</Button>

        {/* Lists */}
        <Button onClick={() => editor.dispatchCommand(INSERT_UNORDERED_LIST_COMMAND, undefined)}>
          • List
        </Button>
        <Button onClick={() => editor.dispatchCommand(INSERT_ORDERED_LIST_COMMAND, undefined)}>
          1. List
        </Button>
      </ButtonGroup>
    </div>
  );
}
