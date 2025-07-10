// MessageWithCanvas.js
import React, { useEffect, useRef, useState } from "react";
import ReactMarkdown from "react-markdown";
import FabricOverlayCanvas from "./FabricOverlayCanvas";

export default function MessageWithCanvas({ msg, messageId, registerRef, isDraw }) {
  const contentRef = useRef();
  const [contentHeight, setContentHeight] = useState(100);

  useEffect(() => {
    if (contentRef.current) {
      setContentHeight(contentRef.current.offsetHeight);
    }
  }, [msg.content]);

  return (
    <div
      style={{
        position: "relative",
        marginBottom: "16px",
        height: `${contentHeight}px`,
      }}
      ref={(el) => {
        if (msg.role === "user") registerRef(messageId, el);
      }}
    >
      <FabricOverlayCanvas isDraw={isDraw} messageId={messageId} height={contentHeight} />
      <div
        ref={contentRef}
        style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: "100%",
            padding: "10px",
            zIndex: isDraw ? 1 : 10,
            pointerEvents: "auto",     // ✅ Always allow pointer events
            userSelect: "text",         // ✅ Always allow text selection
            // touchAction: "manipulation", // ✅ Improves scroll on mobile
            WebkitOverflowScrolling: "touch", // 🟢 iOS smooth scroll
            touchAction: "pan-y",             // 🟢 Allow vertical scroll
        }}
      >
        <strong
          style={{
            color: msg.role === "user" ? "blue" : "green",
            marginRight: "4px",
          }}
        >
          {msg.role}:
        </strong>
        <ReactMarkdown>{msg.content}</ReactMarkdown>
      </div>
    </div>
  );
}
