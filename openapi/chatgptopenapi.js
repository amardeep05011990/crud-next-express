import express from "express";
import dotenv from "dotenv";

import { createServer } from "http";
import { Server } from "socket.io";

import multer from "multer";
import fs from "fs";
import https from 'httpolyglot'
import cors from "cors";
import { OpenAI } from "openai";

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
        if(chunk.type == "response.output_text.delta"){
          const content = chunk?.delta;
          console.log("content===================", content)
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
      // io.emit("chat-stream", "\n\n---\n\n");
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
// const options = {
//   key: fs.readFileSync('./ssl/key.pem', 'utf-8'),
//   cert: fs.readFileSync('./ssl/cert.pem', 'utf-8')
// }

// const httpsServer = https.createServer(options, app)


// Replace app.listen(...)
const server = createServer(app);
const io = new Server(server, {
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

});
// Start the server
server.listen(4000, () => console.log("✅ Server listening on port 4000"));


// app.listen(4000, () => console.log("✅ Server listening on port 4000"));

