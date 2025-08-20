import express from "express";
import dotenv from "dotenv";

import { createServer } from "http";
import { Server } from "socket.io";

import multer from "multer";
import fs from "fs";
import https from 'httpolyglot'
import cors from "cors";
import { OpenAI } from "openai";
import path from "path";
import os from "os";
import { v4 as uuidv4 } from "uuid";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());
//process.env.OPENAI_API_KEY || 
const openai = new OpenAI({
  apiKey: process.env.OPENAPI_SECRECT,
});

app.get("/", (req, res)=>{
  res.status(200).send("health is ok")
});

app.post("/chat", async (req, res) => {
  try {
    const { messages } = req.body;

    const chat = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
        messages: [
                    { role: "user", content: messages }
                ]
    });

    res.json(chat.choices[0].message);
  } catch (err) {
    console.error(err);
    res.status(err.status || 500).send(err.message || "Internal Server Error");
  }
});

app.post("/chat4", async (req, res)=>{
//     import OpenAI from "openai";
// const client = new OpenAI();
const { messages } = req.body;
const response = await openai.responses.create({
    model: "gpt-4.1",
    input: messages
});

console.log(response.output_text);
res.json(response.output_text);
})


app.post("/chatwebsearch", async (req, res)=>{
const { messages } = req.body;

const response = await openai.responses.create({
    model: "gpt-4.1",
    tools: [ { type: "web_search_preview" } ],
    input: messages,
});

console.log(response.output_text);
res.json(response.output_text);
})

app.post("/chatStream", async (req, res) => {
  const { messages } = req.body;

  res.setHeader("Content-Type", "text/plain; charset=utf-8");
  res.setHeader("Transfer-Encoding", "chunked");



  try {

        const userMsg = { role: "user", content: messages };
  const assistantMsg = { role: "assistant", content: "" };

  // 🔁 Emit user question to all clients
  io.emit("new-message", userMsg);
  io.emit("new-message", assistantMsg); // Placeholder for assistant response

    const stream = await openai.responses.create({
      model: "gpt-4.1", // or "gpt-3.5-turbo"
          input: [
        {
            role: "user",
            content: messages,
        },
    ],
      stream: true,
    });
    const arr =[];
    for await (const chunk of stream) {
          console.log("chunk===================>>>>>>>", chunk)

        if(chunk.type == "response.output_text.delta"){
          const content = chunk?.delta;
          arr.push(chunk)
          if (content) {
            io.emit("chat-stream", content); // 🔁 Broadcast to all clients
          }
          if (content) {
              res.write(content); // stream to client
          }
      }
    }
    console.log("===>>>>>>>>>>>>",arr)
      // io.emit("chat-stream", "  \n");
      io.emit("chat-stream", "\n\n---\n\n");
      // io.emit("chat-stream", "\n\n--------------------------------------------------\n\n");

      io.emit("chat-stream-done");
    res.end(); // signal stream complete
  // res.send(messages)
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});


const upload = multer({ dest: "uploads" });

app.post("/transcribe", upload.single("audio"), async (req, res) => {
  try {
    const tempPath = req.file.path;
    const targetPath = tempPath + ".webm";
    console.log("targetPath", targetPath)
    fs.renameSync(tempPath, targetPath);
    const transcription = await openai.audio.transcriptions.create({
      file: fs.createReadStream(targetPath),
      model: "whisper-1",
    });
    console.log("transcription===>>>", transcription);
    console.log("targetPath", targetPath)

    // for dummy testing without api call 
    // let transcription= {}
    // transcription.text =  "dummy text"
    fs.unlinkSync(targetPath); // delete after use
    res.json({ text: transcription.text });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Transcription failed" });
  }
});

// SSL cert for HTTPS access
const options = {
  key: fs.readFileSync('./ssl/key.pem', 'utf-8'),
  cert: fs.readFileSync('./ssl/cert.pem', 'utf-8')
}

const httpsServer = https.createServer(options, app)


// Replace app.listen(...)
// const server = createServer(app);
const io = new Server(httpsServer, {
  cors: { origin: "*" }, // Adjust as per your frontend domain
});

let sharedText = "";

io.on("connection", (socket) => {
  console.log("connection")
  // socket.emit("textUpdate", sharedText); // Send current text to new user

  socket.on("updateText", (text) => {
    console.log("updateText",  text)
    sharedText = text;
    socket.broadcast.emit("textUpdate", text); // Broadcast to others
  });

  socket.on("textUpdate", (data)=>{
    console.log("text updated", data);
  })

  socket.on("draw-event", (data) => {
  // Broadcast drawing data to all other clients
  console.log("draw-event", data)
  socket.broadcast.emit("draw-event", data);
});

});

function saveAsTempWebm(audioChunks) {
  const tempDir = os.tmpdir(); // e.g., /tmp
  const filename = `audio-${uuidv4()}.webm`;
  const filePath = path.join(tempDir, filename);

  const buffer = Buffer.concat(audioChunks.map(chunk => Buffer.from(chunk)));

  fs.writeFileSync(filePath, buffer);
  return filePath;
}

io.on("connection", (socket) => {
  const audioBuffers = [];
    console.log("connection audio_chunk")

  socket.on("audio_chunk", (chunk) => {
    console.log("audio_chunk====>>>>>>>")
    audioBuffers.push(chunk);

    // optional: transcribe every N chunks
    if (audioBuffers.length === 3) {
      const filePath = saveAsTempWebm(audioBuffers);
      openai.audio.transcriptions.create({
        file: fs.createReadStream(filePath),
        model: "whisper-1",
      }).then(transcript => {
        socket.emit("transcription", transcript.text);
      });
    }
  });
});

// Start the server
// server.listen(4000, () => console.log("✅ Server listening on port 4000"));
httpsServer.listen(4000, () => console.log("✅ Server listening on port 4000"));


// app.listen(4000, () => console.log("✅ Server listening on port 4000"));

