import express from "express";
// import dotenv from "dotenv";
import multer from "multer";
import fs from "fs";

import cors from "cors";
import { OpenAI } from "openai";

// dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());
//process.env.OPENAI_API_KEY || 
const openai = new OpenAI({
  apiKey: "REMOVED_SECRET",
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


// app.post("/chatStream", async (req, res)=>{
// const { messages } = req.body;

// const stream = await openai.responses.create({
//     model: "gpt-4.1",
//     input: [
//         {
//             role: "user",
//             content: messages,
//         },
//     ],
//     stream: true,
// });

// for await (const event of stream) {
//     console.log(event);
// }

// })

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
        res.write(content); // stream to client
        // res.write(`data: ${content}\n\n`);

      }
  //  if (content) {
  //       res.write(`data: ${content}\n\n`); // 👈 formatted as SSE
  //     }
  //   res.write("data: [DONE]\n\n");
        }

    }
    console.log("===>>>>>>>>>>>>",arr)

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


app.listen(4000, () => console.log("✅ Server listening on port 4000"));
