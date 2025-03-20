"use client";

import React from "react";
import { Editor } from "@tinymce/tinymce-react";

export default function TinyMCEEditor({ content, onChange }) {
  return (
    <Editor
      apiKey="xumshx6u2dqboij57cqfqc5kpzal1r11r35ccou5m70f9sfd" // ✅ Free usage (no API key needed)
      initialValue={content || ""}
      init={{
        height: 300,
        menubar: false, // Hide unnecessary menu bar
        plugins: "lists link image code", // Enable formatting
        toolbar: "undo redo | bold italic underline | bullist numlist | link image code",
        content_style: "body { font-family:Arial,sans-serif; font-size:14px }",
      }}
      onEditorChange={(newValue) => onChange(newValue)}
    />
  );
}
