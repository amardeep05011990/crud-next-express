"use client";

import { useState } from "react";
import TextEditor from "./../components/TextEditor";

export default function HomePage() {
  const [content, setContent] = useState("");

  return (
    <div style={{ maxWidth: "800px", margin: "auto", padding: "20px" }}>
      <h2>Custom Text Editor</h2>
      <TextEditor value={content} onChange={setContent} />
      
      {/* ✅ Show Preview */}
      <div style={{ marginTop: "20px", padding: "10px", border: "1px solid #ddd" }}>
        <h3>Preview</h3>
        <div dangerouslySetInnerHTML={{ __html: content }} />
      </div>
    </div>
  );
}
