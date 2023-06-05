const PORT = process.env.PORT ||8000;
import express, { json } from 'express';
import cors from 'cors';
import fetch from 'node-fetch';


const app = express();
app.use(json());
app.use(cors());

const API_KEY = "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";

app.post('/completions', async (req, res) => {
  const options = {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${API_KEY}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      model: "gpt-3.5-turbo",
      messages: [{ role: "user", content: req.body.message }],
      max_tokens: 1000
    })
  };

  try {
    const response = await fetch("https://api.openai.com/v1/chat/completions", options);
    const data = await response.json();
    res.send(data);
  } catch (error) {
    console.error(error);
  }
});

app.post('/generations', async (req, res) => {
  const { prompt } = req.body;

  const options = {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${API_KEY}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      prompt: prompt,
      n: 2,
      size: "1024x1024"
    })
  };

  try {
    const response = await fetch("https://api.openai.com/v1/images/generations", options);
    const data = await response.json();
    res.send(data);
  } catch (error) {
    console.error(error);
  }
});

app.listen(PORT, () => console.log("Your server is running on port " + PORT));
