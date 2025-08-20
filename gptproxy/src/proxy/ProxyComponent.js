// ProxyComponent.js
import React, { useState, useEffect, useRef } from "react";
import ReactMarkdown from "react-markdown";
import { io } from "socket.io-client";
import AudioToText from "./AudioToText";
import MessageWithCanvas from "./MessageWithCanvas";

const apiurl = process.env.REACT_APP_API_URL;
const socket = io(apiurl);

export default function ProxyComponent() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [currentAnswerIndex, setCurrentAnswerIndex] = useState(null);
  const [isDraw, setIsDraw] = useState(true);
  const messageRef = useRef();
  const questionRefs = useRef([]);

  const [brushType, setBrushType] = useState("pencil");
  const [brushColor, setBrushColor] = useState("#ff0000");


  function audioToTextFunction(data) {
    setInput(data);
    socket.emit("updateText", data);
  }

  const sendMessage = async () => {
    const userMsg = { role: "user", content: input };
    const assistantMsg = { role: "assistant", content: "" };

    // await setMessages((prev) => {
    //   const newMessages = [...prev, userMsg, assistantMsg];
    //   setCurrentAnswerIndex(newMessages.length - 1); // Track assistant message index
    //   return newMessages;
    // });

    socket.emit("updateText", input);
    // socket.emit("chat-stream", messages); // make sure your backend listens to this
    // setInput("");

    // Optional: trigger backend processing
    await fetch(`${apiurl}/chatStream`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ messages: input }),
    });
  };

  // useEffect(() => {
  //   let fullText = "";

  //   socket.on("chat-stream", (chunk) => {
  //     fullText += chunk;
  //     console.log("chat-stream working=====>>>>>>>", chunk)

  //     setMessages((prev) => {
  //       if (currentAnswerIndex === null || !prev[currentAnswerIndex]) return prev;
  //       const updated = [...prev];
  //       updated[currentAnswerIndex] = {
  //         ...updated[currentAnswerIndex],
  //         content: fullText,
  //       };
  //       return updated;
  //     });
  //   });
    
  //   socket.on("textUpdate", (text) => setInput(text));

  //   return () => {
  //     // socket.off("chat-stream");
  //     socket.off("textUpdate");
  //   };
  // }, [currentAnswerIndex]);

  useEffect(() => {
  let fullText = "";

  // 👇 Listen to question/assistant placeholders
  socket.on("new-message", (msg) => {
    setMessages((prev) => {
      const newMsgs = [...prev, msg];
      if (msg.role === "assistant") {
        setCurrentAnswerIndex(newMsgs.length - 1);
      }
      return newMsgs;
    });
  });

  // 👇 Handle streamed answer chunks
  socket.on("chat-stream", (chunk) => {
    fullText += chunk;
    setMessages((prev) => {
      if (currentAnswerIndex === null || !prev[currentAnswerIndex]) return prev;
      const updated = [...prev];
      updated[currentAnswerIndex] = {
        ...updated[currentAnswerIndex],
        content: fullText,
      };
      return updated;
    });
  });

  socket.on("textUpdate", (text) => {
    console.log("textUpdate", text)
      return setInput(text);
  });

  return () => {
    socket.off("chat-stream");
    socket.off("new-message");
    // socket.off("textUpdate");
  };
}, [currentAnswerIndex]);

//   useEffect(() => {
//     const lastUserIndex = [...messages].reverse().findIndex(m => m.role === 'user');
//     const actualIndex = lastUserIndex !== -1 ? messages.length - 1 - lastUserIndex : -1;
//     if (actualIndex !== -1 && questionRefs.current[actualIndex]) {
//       questionRefs.current[actualIndex].scrollIntoView({ behavior: 'smooth', block: 'start' });
//     }
//   }, [messages.length]);

//     useEffect(() => {
//   const lastUserIndex = [...messages].reverse().findIndex(m => m.role === 'user');
//   const actualIndex = lastUserIndex !== -1 ? messages.length - 1 - lastUserIndex : -1;

//   if (actualIndex !== -1 && messageRef.current) {
//     // Scroll the container to the bottom (newest message)
//       console.log("messageRef.current.scrollHeight---------=====>>>>>>>", messageRef.current.scrollHeight)
//       console.log("messageRef.current---------=====>>>>>>>", messageRef.current)


//     messageRef.current.scrollTop = messageRef.current.scrollHeight;
//   }
// }, [messages.length]);

useEffect(() => {
  const lastUserIndex = [...messages].reverse().findIndex(m => m.role === 'user');
  const actualIndex = lastUserIndex !== -1 ? messages.length - 1 - lastUserIndex : -1;

  const el = questionRefs.current[actualIndex];
  const container = messageRef.current;
  console.log("comtainer", container)


  if (el && container) {
    const offsetTop = el.offsetTop;
  console.log("offsetTop", offsetTop)

    container.scrollTo({
      top: offsetTop,
      behavior: 'smooth',
    });
  }
}, [messages.length]);

// useEffect(() => {
//   const lastUserIndex = [...messages].reverse().findIndex(m => m.role === 'user');
//   const actualIndex = lastUserIndex !== -1 ? messages.length - 1 - lastUserIndex : -1;

//   const el = questionRefs.current[actualIndex];
//   const container = messageRef.current;

//   if (el && container) {
//     const elRect = el.getBoundingClientRect();
//     const containerRect = container.getBoundingClientRect();
//     const scrollOffset = elRect.top - containerRect.top + container.scrollTop;
//     console.log("elRect",elRect)
//     console.log("elRect",elRect)
//     console.log("elRect",elRect)


//     container.scrollTo({
//       top: scrollOffset,
//       behavior: 'smooth',
//     });
//   }
// }, [messages.length]);

// useEffect(() => {
//   const lastUserIndex = [...messages].reverse().findIndex(m => m.role === 'user');
//   const actualIndex = lastUserIndex !== -1 ? messages.length - 1 - lastUserIndex : -1;

//   const el = questionRefs.current[actualIndex];
//   const container = messageRef.current;

//   if (el && container) {
//     const offsetTop = el.offsetTop;
//     container.scrollTo({
//       top: offsetTop,
//       behavior: 'smooth',
//     });
//   }
// }, [messages.length]);


// useEffect(() => {
//   const lastUserIndex = [...messages].reverse().findIndex(m => m.role === 'assistant');
//   const actualIndex = lastUserIndex !== -1 ? messages.length - 1 - lastUserIndex : -1;

//   const el = questionRefs.current[actualIndex];
//   if (el) {
//     el.scrollIntoView({
//       behavior: 'smooth',
//       block: 'start',
//       inline: 'nearest',
//     });
//   }
// }, [messages.length]);


// full page scroll
// useEffect(() => {
//   window.scrollTo({ top: document.body.scrollHeight, behavior: "smooth" });
// }, [messages.length]);

  const handleChange = (e) => {
    const text = e.target.value;
    setInput(text);
    socket.emit("updateText", text);
  };
      // console.log("messages---------=====>>>>>>>", messages)

return (
    <div style={{ display: "flex", flexDirection: "column", height: "100vh" }}>
      <div
        ref={messageRef}
        style={{
          flex: 1,
          overflowY: "auto",
          scrollBehavior: "smooth",
          padding: "10px",
        }}
      >
        {messages.map((msg, i) => (
          <MessageWithCanvas
            key={i}
            msg={msg}
            messageId={i}
            isDraw={isDraw}
            registerRef={(el) => {
              if (msg.role === "user") questionRefs.current[i] = el;
            }}
            brushType={brushType}         // Controlled from state in ProxyComponent
            brushColor={brushColor}       // Controlled from state in ProxyComponent
          />
        ))}
      </div>

      <div
        style={{
          padding: "15px",
          borderTop: "1px solid #ccc",
          background: "#fafafa",
          position: "sticky",
          bottom: 0,
          boxShadow: "0 -2px 6px rgba(0,0,0,0.05)",
          zIndex: 10,
        }}
      >
        {/* Textarea */}
        <textarea
          value={input}
          onChange={(e) => {
            setInput(e.target.value);
            socket.emit("updateText", e.target.value);
          }}
          placeholder="Ask me anything..."
          rows={3}
          style={{
            width: "100%",
            padding: "10px",
            fontSize: "16px",
            borderRadius: "8px",
            border: "1px solid #ccc",
            resize: "none",
            fontFamily: "inherit",
          }}
        />
        
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            gap: "8px",
            marginTop: "8px",
            alignItems: "center",
            flexWrap: "wrap",
          }}
        >
          {/* Send button */}
          <button
            onClick={sendMessage}
            style={{
              flex: 1,
              padding: "6px 50px", // smaller height
              fontSize: "14px",
              backgroundColor: "#4CAF50",
              color: "#fff",
              border: "none",
              borderRadius: "6px",
              fontWeight: "500",
              cursor: "pointer",
            }}
          >
            📤 Send
          </button>

          {/* Enable/Disable Drawing */}
          <button
            onClick={() => setIsDraw((prev) => !prev)}
            style={{
              flex: 1,
              padding: "0px 25px", // smaller height
              fontSize: "14px",
              backgroundColor: isDraw ? "#f44336" : "#2196F3",
              color: "#fff",
              border: "none",
              borderRadius: "6px",
              fontWeight: "500",
              cursor: "pointer",
            }}
          >
            {isDraw ? "🛑 Disable" : "✏️ Enable"} Drawing
          </button>


        </div>


        {/* Drawing tools */}
        <div style={{ display: "flex", gap: "10px", marginTop: "12px", alignItems: "center", flexWrap: "wrap" }}>
          {/* Tool selection */}
          <div style={{ display: "flex", gap: "8px" }}>
            <button
              onClick={() => setBrushType("pencil")}
              style={{
                padding: "6px 12px",
                borderRadius: "6px",
                border: brushType === "pencil" ? "2px solid #007BFF" : "1px solid #ccc",
                backgroundColor: brushType === "pencil" ? "#e0f0ff" : "#fff",
                cursor: "pointer",
              }}
            >
              ✏️ Pencil
            </button>

            <button
              onClick={() => setBrushType("highlighter")}
              style={{
                padding: "6px 12px",
                borderRadius: "6px",
                border: brushType === "highlighter" ? "2px solid #007BFF" : "1px solid #ccc",
                backgroundColor: brushType === "highlighter" ? "#e0f0ff" : "#fff",
                cursor: "pointer",
              }}
            >
              🖍️ Highlighter
            </button>
          </div>

          {/* Color selection */}
          <div style={{ display: "flex", gap: "6px" }}>
            {[
              { color: "#ff0000", name: "Red" },
              { color: "#00ff00", name: "Green" },
              { color: "#ffff00", name: "Yellow" },
            ].map(({ color, name }) => (
              <button
                key={color}
                onClick={() => setBrushColor(color)}
                style={{
                  backgroundColor: color,
                  color: color === "#ffff00" ? "#000" : "#fff",
                  padding: "6px 12px",
                  borderRadius: "6px",
                  border: brushColor === color ? "2px solid #333" : "1px solid #ccc",
                  cursor: "pointer",
                  fontWeight: "bold",
                }}
              >
                {name}
              </button>
            ))}
          </div>
                    {/* Audio to Text component */}
          <div style={{ flexShrink: 0 }}>
            <AudioToText audioToText={audioToTextFunction} />
          </div>
        </div>
      </div>


    </div>
  );
}
