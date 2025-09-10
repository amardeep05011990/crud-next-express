import express from "express";
import cors from "cors";

import { generateBackendFiles } from '../crud-app/generate-backend.js';
// import dotenv from "dotenv";
const app = express();
// app.use(express.json());
app.use(cors({
  origin: "http://localhost:3000",
  credentials: true // ✅ allow cookies
}));

app.use(express.json({ limit: '10mb' })); // Allow large payloads

app.post('/api/generate-backend', (req, res) => {
  try {
    const schema = req.body;
    const result = generateBackendFiles(schema);

    res.json(result);
  } catch (err) {
    console.error('Error:', err);
    res.status(500).json({ success: false, message: err.message });
  }
});
// app.post('/api/generate-backend', (req, res) => {
//  try {
//     const schema = req.body; // The schema (collections + relations) from frontend

//     if (!schema.collections || !schema.relations) {
//       return res.status(400).json({ success: false, message: 'Invalid schema format' });
//     }

//     const result = generateBackendFiles(schema);

//     res.json(result);
//   } catch (err) {
//     console.error('Error generating backend:', err);
//     res.status(500).json({ success: false, message: 'Generation failed', error: err.message });
//   }
// });

app.listen(4000, () => console.log("✅ Server listening on port 4000"));
