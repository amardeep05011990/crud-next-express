import express from "express";
// import dotenv from "dotenv";
// import cors from "cors";
import { OpenAI } from "openai";

// dotenv.config();

const app = express();
// app.use(cors());
app.use(express.json());
//process.env.OPENAI_API_KEY || 
const openai = new OpenAI({
  apiKey: "REMOVED_SECRET",
});

// app.post("/chat", async (req, res) => {
//   try {
//     const { messages } = req.body;

//     const chat = await openai.chat.completions.create({
//       model: "gpt-3.5-turbo",
//       messages,
//     });

//     res.json(chat.choices[0].message);
//   } catch (err) {
//     console.error(err);
//     res.status(err.status || 500).send(err.message || "Internal Server Error");
//   }
// });

app.listen(4000, () => console.log("✅ Server listening on port 4000"));
