const express = require('express');
const axios = require('axios');
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

app.post('/chat', async (req, res) => {
  try {
    const { messages } = req.body;

    const response = await axios.post(
      'https://api.openai.com/v1/chat/completions',
      {
        model: 'gpt-3.5-turbo',
        messages,
      },
      {
        headers: { // ${process.env.OPENAI_API_KEY}
          Authorization: `Bearer REMOVED_SECRET`,
            'OpenAI-Organization': 'org-JkyzeBecXLxWFdQQBLLMjmec',
            // 'OpenAI-Project': '$PROJECT_ID',
          'Content-Type': 'application/json'


        },
      }
    );

    res.json(response.data);
  } catch (err) {
    console.error(err.response?.data || err.message);
    res.status(err.response?.status || 500).send(err.message);
  }
});

app.listen(4000, () => console.log('✅ Server running on port 4000'));
