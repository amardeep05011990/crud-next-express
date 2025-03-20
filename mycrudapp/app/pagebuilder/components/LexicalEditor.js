"use client";

import { useEffect } from "react";
import { LexicalComposer } from "@lexical/react/LexicalComposer";
import { RichTextPlugin } from "@lexical/react/LexicalRichTextPlugin";
import { ContentEditable } from "@lexical/react/LexicalContentEditable";
import { HistoryPlugin } from "@lexical/react/LexicalHistoryPlugin";
import { ListPlugin } from "@lexical/react/LexicalListPlugin";
import { ListItemNode, ListNode } from "@lexical/list";
import { OnChangePlugin } from "@lexical/react/LexicalOnChangePlugin";
import {
    $getRoot,
    $createParagraphNode,
    $isTextNode,
    $isElementNode,
  } from "lexical";
  
import { $generateNodesFromDOM } from "@lexical/html";
import { $generateHtmlFromNodes } from "@lexical/html";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { HeadingNode, QuoteNode } from "@lexical/rich-text";
import { Toolbar } from "./LexicalToolbar";


export default function LexicalEditor({ content = "", onChange }) {
  const initialConfig = {
    namespace: "MyEditor",
    onError(error) {
      console.error("Lexical Editor Error:", error);
    },
    nodes: [HeadingNode, QuoteNode, ListNode, ListItemNode],
    editorState: null, // ✅ Let the editor initialize itself properly
  };

  return (
    <LexicalComposer initialConfig={initialConfig}>
      <div className="editor-container">
        <Toolbar />
        <RichTextPlugin
          contentEditable={<ContentEditable className="editor-content" />}
          placeholder={<div className="editor-placeholder">Type something...</div>}
        />
        <HistoryPlugin />
        <ListPlugin />
        <OnChangePlugin
          onChange={(editorState, editor) => {
            editor.update(() => {
              const html = $generateHtmlFromNodes(editor, null);
              console.log("html", html)
              onChange(html);
            });
          }}
        />
        <LoadInitialContent content={content} />
      </div>
    </LexicalComposer>
  );
}

// ✅ Load Saved Content Correctly
// function LoadInitialContent({ content }) {
//   const [editor] = useLexicalComposerContext();

//   useEffect(() => {
//     if (content) {
//       editor.update(() => {
//         const parser = new DOMParser();
//         const dom = parser.parseFromString(content, "text/html");
//         const nodes = $generateNodesFromDOM(editor, dom);
//         $getRoot().clear().append(...nodes);
//       });
//     }
//   }, [content, editor]); // ✅ Ensure content updates properly

//   return null;
// }

function LoadInitialContent({ content }) {
    const [editor] = useLexicalComposerContext();
  
    useEffect(() => {
      if (!content) return; // ✅ Prevent empty content issues
  
      editor.update(() => {
        const root = $getRoot(); // ✅ Get Lexical root node
        root.clear(); // ✅ Clear existing content
        
        const parser = new DOMParser();
        const dom = parser.parseFromString(content, "text/html");
  
        // ✅ Convert parsed HTML into Lexical Nodes
        const nodes = $generateNodesFromDOM(editor, dom);
  
        if (nodes.length > 0) {
          nodes.forEach((node) => {
            if ($isTextNode(node)) {
              // ✅ If it's a text node, wrap it in a <p>
              const paragraph = $createParagraphNode();
              paragraph.append(node);
              root.append(paragraph);
            } else if ($isElementNode(node)) {
              // ✅ If it's a valid element node, append it directly
              root.append(node);
            }
          });
        }
      });
    }, [content, editor]);
  
    return null;
  }
  
