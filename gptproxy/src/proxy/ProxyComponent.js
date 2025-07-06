import React, { useState, useEffect } from "react";
import ReactMarkdown from "react-markdown";
// import axios from "axios";
import { io } from "socket.io-client";
import AudioToText from "./AudioToText";
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

  const handleChange = (e) => {
    const newText = e.target.value;
    setInput(newText);
    socket.emit("updateText", newText);
  };

  return (
    <div>
      <div style={{ maxHeight: 300, overflowY: "auto" }}>
        {messages.map((msg, i) => (
          <div key={i}>
            <strong>{msg.role}:</strong>
            <ReactMarkdown>{msg.content}</ReactMarkdown>
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
      <button onClick={sendMessage}>Send</button>
    </div>
  );
}

