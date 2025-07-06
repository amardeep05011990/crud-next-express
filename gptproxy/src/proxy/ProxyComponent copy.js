// import React from 'react'

// export default function ProxyComponent() {

//     function getQuery(e){
//         console.log(e.target.value)
//     }

//   return (
//     <>
//     <h1>hello proxy</h1>
//        <textarea name="query" onChange={getQuery}></textarea>

//        <h1>chat gpt iframe</h1>
//        <iframe
//   src="https://chat.openai.com/"
//   style={{ width: "100%", height: "100vh", border: "none" }}
// ></iframe>
//     </>
//   )
// }

import React, { useState, useEffect } from "react";
import ReactMarkdown from "react-markdown";
import axios from "axios";
import { io } from "socket.io-client";
import AudioToText from "./AudioToText";
const apiurl = process.env.REACT_APP_API_URL;

const socket = io(apiurl);

export default function ProxyComponent() {
  console.log("apiurl", apiurl);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");

//   const sendMessage = async () => {
//     const userMessage = { role: "user", content: input };
//     const newMessages = [...messages, userMessage];
//     setMessages(newMessages);
//     setInput("");
// console.log("hiiiiiiiii")
//     const res = await axios.post(
//       "https://api.openai.com/v1/chat/completions",
//       {
//         model: "gpt-3.5-turbo", // Or "gpt-4"  gpt-3.5-turbo if you have access
//         messages: newMessages,
//       },
//       {
//         headers: {
//           Authorization: `Bearer REMOVED_SECRET`,
//           "Content-Type": "application/json",
//         },
//       }
//     );
//     console.log(res.data)
//     const reply = res.data.choices[0].message;
//     setMessages([...newMessages, reply]);
//   };

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
  const reader = res.body.getReader();
  const decoder = new TextDecoder("utf-8");

  let done = false;
   let botMessage = "";
  // while (!done) {
  //   const { value, done: doneReading } = await reader.read();
  //   done = doneReading;
  //   const chunk = decoder.decode(value);
  //   console.log("Chunk:", chunk);

  //    // Optional: handle "data: [DONE]" or SSE format
  //     const cleanChunk = chunk.replace(/^data:\s*/, "").replace(/\n\n/g, "");

  //     botMessage += cleanChunk;

  //     // Update last bot message progressively
  //     setMessages((prev) => {
  //       const last = prev[prev.length - 1];
  //       if (last?.role === "assistant") {
  //         return [...prev.slice(0, -1), { ...last, content: botMessage }];
  //       } else {
  //         return [...prev, { role: "assistant", content: botMessage }];
  //       }
  //     });
  // }


  //   let fullResponse = "";

  // while (true) {
  //   const { value, done } = await reader.read();
  //   if (done) break;

  //   const chunk = decoder.decode(value);
  //   // Split by data: for Server-Sent Events (SSE)
  //   const lines = chunk.split("\n").filter(line => line.startsWith("data: "));

  //   for (const line of lines) {
  //     const clean = line.replace("data: ", "").trim();
  //     if (clean === "[DONE]") continue;

  //     fullResponse += clean;
  //     // Optionally update UI in real-time:
  //     setMessages([{ role: "assistant", content: fullResponse }]);
  //   }
  // }

    let fullText = "";
  // let done = false;

  while (!done) {
    const { value, done: doneReading } = await reader.read();
    done = doneReading;

    const chunkValue = decoder.decode(value);
    fullText += chunkValue;

    setMessages([{ role: "CorporateCubicles", content: fullText }]); // real-time render
  }
};

 useEffect(() => {
    socket.on("textUpdate", (text) => {
      console.log("textUpdate",input)
      setInput(text);
    });

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
          // <p key={i}>
          //   <strong>{msg.role}: </strong> {msg.content}
          // </p>
          <div key={i}>
            <strong>{msg.role}:</strong>
            <ReactMarkdown>{msg.content}</ReactMarkdown>
          </div>
        ))}
      </div>
      {/* <input
        value={input}
        onChange={(e) => setInput(e.target.value)}
        placeholder="Ask me anything..."
      /> */}
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

