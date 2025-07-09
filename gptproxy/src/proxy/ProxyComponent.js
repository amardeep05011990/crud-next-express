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

  useEffect(() => {
    const lastUserIndex = [...messages].reverse().findIndex(m => m.role === 'user');
    const actualIndex = lastUserIndex !== -1 ? messages.length - 1 - lastUserIndex : -1;
    if (actualIndex !== -1 && questionRefs.current[actualIndex]) {
      questionRefs.current[actualIndex].scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, [messages.length]);

  const handleChange = (e) => {
    const text = e.target.value;
    setInput(text);
    socket.emit("updateText", text);
  };
      console.log("messages---------=====>>>>>>>", messages)

  return (
    <>
      <div ref={messageRef} style={{ maxHeight: 400, overflowY: "auto", padding: "10px" }}>
        {messages.map((msg, i) => (
          <MessageWithCanvas
            key={i}
            msg={msg}
            messageId={i}
            isDraw={isDraw}
            registerRef={(index, el) => {
              if (msg.role === "user") questionRefs.current[index] = el;
            }}
          />
        ))}
      </div>

      <textarea
        value={input}
        onChange={handleChange}
        placeholder="Ask me anything..."
        rows={5}
        className="responsive-textarea"
      />

      <AudioToText audioToText={audioToTextFunction} />
      <button onClick={sendMessage}>Send</button>
      <button onClick={() => setIsDraw((prev) => !prev)}>
        {isDraw ? "Disable" : "Enable"} Drawing
      </button>
    </>
  );
}
