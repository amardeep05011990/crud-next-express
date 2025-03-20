"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import "react-quill/dist/quill.snow.css";

// ✅ Dynamically import React Quill (to avoid SSR issues)
const ReactQuill = dynamic(() => import("react-quill"), { ssr: false });

export default function TextEditor({ value, onChange }) {
  const [editorValue, setEditorValue] = useState(value || "");

  const handleChange = (content) => {
    setEditorValue(content);
    if (onChange) onChange(content);
  };

  return (
    <div>
      <ReactQuill
        value={editorValue}
        onChange={handleChange}
        modules={modules}
        formats={formats}
        placeholder="Start typing..."
        theme="snow"
        style={{ height: "300px" }}
      />
    </div>
  );
}

// ✅ Define Toolbar Options
const modules = {
  toolbar: [
    [{ header: [1, 2, 3, false] }],
    ["bold", "italic", "underline", "strike"],
    [{ list: "ordered" }, { list: "bullet" }],
    ["blockquote", "code-block"],
    [{ align: [] }],
    [{ color: [] }, { background: [] }],
    [{ font: [] }],
    [{ script: "sub" }, { script: "super" }],
    [{ indent: "-1" }, { indent: "+1" }],
    ["link", "image", "video"],
    ["clean"],
  ],
};

// ✅ Allowed Formats
const formats = [
  "header",
  "bold",
  "italic",
  "underline",
  "strike",
  "blockquote",
  "code-block",
  "list",
  "bullet",
  "indent",
  "align",
  "color",
  "background",
  "font",
  "script",
  "link",
  "image",
  "video",
];
