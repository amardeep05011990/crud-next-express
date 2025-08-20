// MessageWithCanvas.js
import React, { useEffect, useRef, useState } from "react";
import ReactMarkdown from "react-markdown";
import FabricOverlayCanvas from "./FabricOverlayCanvas";

export default function MessageWithCanvas({ msg, messageId, registerRef, isDraw, brushType, brushColor  }) {
  const contentRef = useRef();
  const [contentHeight, setContentHeight] = useState(60);

  useEffect(() => {
    if (contentRef.current) {
      setContentHeight(contentRef.current.offsetHeight);
    }
  }, [msg.content]);

  return (
    <div
      style={{
        position: "relative",
        marginBottom: "-35px",
        height: `${Math.max(contentHeight, 50)}px`,
      }}
      ref={(el) => {
        if (msg.role === "user") registerRef(messageId, el);
      }}
    >
      <FabricOverlayCanvas
       isDraw={isDraw} 
       messageId={messageId} 
       height={contentHeight} 
       brushType={brushType}         // Controlled from state in ProxyComponent
       brushColor={brushColor}       // Controlled from state in ProxyComponent
       />
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
            touchAction: "pan-y",      
             backgroundColor: "transparent",       // 🟢 Allow vertical scroll
        }}
      >
        <strong
          style={{
            color: msg.role === "user" ? "blue" : "green",
            marginRight: "4px",
                marginTop: "5px"
          }}
        >
          {msg.role }:
        </strong>
          <div style={{ marginTop: "-20px" }}>
          <ReactMarkdown>{msg.content}</ReactMarkdown>
        </div>
      </div>
    </div>
  );
}
