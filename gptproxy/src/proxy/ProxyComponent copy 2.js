import React, { useState, useEffect, useRef } from "react";
import ReactMarkdown from "react-markdown";
// import axios from "axios";
import { io } from "socket.io-client";
import AudioToText from "./AudioToText";
import VoiceStreamer from "./VoiceStreamer";
import FabricOverlayCanvas from "./FabricOverlayCanvas";

const apiurl = process.env.REACT_APP_API_URL;

const socket = io(apiurl);

export default function ProxyComponent() {
  console.log("apiurl", apiurl);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");

function audioToTextFunction(audiToTextData){
  setInput(audiToTextData);
  socket.emit("updateText", audiToTextData);
  console.log("audiToTextData", audiToTextData, input)
  
}

const sendMessage = async () => {
  // Add user message first before making request
  // const userMsg = { role: "user", content: input };
  // // await setMessages((prev) => [...prev, userMsg]); // show user question immediately
  //   // Ensure user message is in state BEFORE assistant starts streaming
  // await new Promise((resolve) => {
  //   setMessages((prev) => {
  //     resolve();
  //     return [...prev, userMsg];
  //   });
  // });
  // socket.emit("updateText", input);
  //   socket.emit("startChatStream", input); // make sure your backend listens to this

  // setInput("");

  const res = await fetch(`${apiurl}/chatStream`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({messages: input})
    // JSON.stringify({
    //   messages: [{ role: "user", content: "What is a closure?" }],
    // }),
  });
  // const data = await res.json();


  console.log("res===", res)
  // const reader = res.body.getReader();
  // const decoder = new TextDecoder("utf-8");

  // let done = false;
  //  let botMessage = "";

    // let fullText = "";
  // let done = false;

    // while (!done) {
    //   const { value, done: doneReading } = await reader.read();
    //   done = doneReading;

    //   const chunkValue = decoder.decode(value);
    //   fullText += chunkValue;

    //   setMessages([{ role: "CorporateCubicles", content: fullText }]); // real-time render
    // }
};

 useEffect(() => {
    let fullText = "";

    socket.on("textUpdate", (text) => {
      console.log("textUpdate",input)
      setInput(text);
    });
    socket.on("chat-stream", (chunk) => {
      console.log("chunck data", chunk)
      fullText += chunk;
      setMessages([{ role: "CorporateCubicles", content: fullText }]);
    });

    socket.on("chat-stream-done", () => {
      console.log("✅ Stream complete");
    });

    // return () => {
    //   socket.off("chat-stream");
    //   socket.off("chat-stream-done");
    // };
    // return () => socket.disconnect();
  }, []);

// useEffect(() => {
//   let fullText = "";
//   let currentIndex = null;

//   const handleChunk = (chunk) => {
//     fullText += chunk;

//     setMessages((prev) => {
//       const updated = [...prev];
//       if (currentIndex === null) {
//         currentIndex = updated.length;
//         updated.push({ role: "assistant", content: chunk });
//       } else {
//         updated[currentIndex] = {
//           ...updated[currentIndex],
//           role: "assistant",
//           content: fullText,
//         };
//       }
//       return updated;
//     });
//   };

//   socket.on("chat-stream", handleChunk);

//   socket.on("chat-stream-done", () => {
//     fullText = "";
//     currentIndex = null;
//   });

//   return () => {
//     socket.off("chat-stream", handleChunk);
//     socket.off("chat-stream-done");
//   };
// }, []);




const messageRef = useRef();
const lastMessageRef = useRef(null);
const questionRefs = useRef([]);


// useEffect(() => {
//   if (lastMessageRef.current && messageRef.current) {
//     // Scroll so latest Q or A is visible at the top
//     messageRef.current.scrollTop = lastMessageRef.current.offsetTop;
//   }
// }, [messages]);
useEffect(() => {
  const lastUserIndex = [...messages].reverse().findIndex(m => m.role === 'user');
  const actualIndex = lastUserIndex !== -1 ? messages.length - 1 - lastUserIndex : -1;

  if (actualIndex !== -1 && questionRefs.current[actualIndex]) {
    questionRefs.current[actualIndex].scrollIntoView({ behavior: 'smooth', block: 'start' });
  }
}, [messages.length]);




  const handleChange = (e) => {
    const newText = e.target.value;
    setInput(newText);
    socket.emit("updateText", newText);
  };

  return (
    <>
      {/* <div ref={messageRef} style={{ maxHeight: 300, overflowY: "auto" }}>
        {messages.map((msg, i) => (
          <div key={i}>
            <strong>{msg.role}:</strong>
            <ReactMarkdown>{msg.content}</ReactMarkdown>
          </div>
        ))}
      </div> */}
<div ref={messageRef} style={{ maxHeight: 400, overflowY: "auto", padding: '10px' }}>
  {messages.map((msg, i) => (
    // <div
    //   key={i}
    //   ref={el => {
    //     if (msg.role === 'user') questionRefs.current[i] = el;
    //   }}
    //   style={{ marginBottom: '16px' }}
    // >
    //   <strong style={{ color: msg.role === "user" ? "blue" : "green" }}>{msg.role}:</strong>
    //   <ReactMarkdown>{msg.content}</ReactMarkdown>
    // </div>
    // <div
    //   key={i}
    //   style={{
    //     marginBottom: '8px',
    //     display: "flex",
    //     flexWrap: "wrap",
    //     alignItems: "baseline",
    //   }}
    // >
    //   <strong
    //     style={{
    //       color: msg.role === "user" ? "blue" : "green",
    //       marginRight: '4px',
    //       textTransform: 'capitalize',
    //     }}
    //   >
    //     {msg.role}:
    //   </strong>
    //   <span style={{ whiteSpace: "pre-wrap" }}>
    //     <ReactMarkdown>{msg.content}</ReactMarkdown>
    //   </span>
    // </div>
         <div
  key={i}
  style={{
    marginBottom: '8px',
    position: 'relative', // needed for canvas overlay
  }}
>
  {/* Message Text */}
  <div
    style={{
      display: "flex",
      flexWrap: "wrap",
      alignItems: "baseline",
      padding: '8px',
      backgroundColor: '#f9f9f9',
    }}
  >
    <strong
      style={{
        color: msg.role === "user" ? "blue" : "green",
        marginRight: '4px',
        textTransform: 'capitalize',
      }}
    >
      {msg.role}:
    </strong>
    <span style={{ whiteSpace: "pre-wrap" }}>
      <ReactMarkdown>{msg.content}</ReactMarkdown>
    </span>
  </div>

  {/* Canvas overlay for drawing */}
  <FabricOverlayCanvas messageId={i} />
</div>
 

  ))}
</div>



      <textarea
        value={input}
        // onChange={(e) => setInput(e.target.value)}
        placeholder="Ask me anything..."
        onChange={handleChange}
        rows={5}
         className="responsive-textarea"
        // style={{ width: "80%" }}
      />
      <AudioToText audioToText={audioToTextFunction} />
      {/* <VoiceStreamer/> */}
      <button onClick={sendMessage}>Send</button>
    </>
  );
}

