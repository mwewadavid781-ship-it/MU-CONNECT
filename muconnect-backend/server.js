// muconnect-backend/server.js
// AHAK DEV × TEKARU

const express = require('express');
const cors = require('cors');
const Groq = require('groq-sdk');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Initialize Groq AI Client
const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

// AI Assistant Route (POST /api/ai/chat)
app.post('/api/ai/chat', async (req, res) => {
  try {
    const { message } = req.body;

    if (!message) {
      return res.status(400).json({ error: 'Message content is required.' });
    }

    // Call Groq Llama 3 API
    const completion = await groq.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      messages: [
        {
          role: 'system',
          content: "You are Muconnect AI, AHAK DEV x TEKARU's assistant for the Mulungushi University campus marketplace. Help buyers find products/food and sellers setup descriptions."
        },
        { role: 'user', content: message }
      ],
      temperature: 0.7,
      max_tokens: 500
    });

    const reply = completion.choices[0]?.message?.content || "I couldn't process that request right now.";
    res.status(200).json({ reply });

  } catch (error) {
    console.error('Groq AI Error:', error);
    res.status(500).json({ error: 'AI service temporarily unavailable. Use standard search.' });
  }
});

// Basic Health Check Route (GET /)
app.get('/', (req, res) => {
  res.status(200).json({ status: 'ok', message: 'MUCONNECT Backend is Live!', developer: 'AHAK DEV x TEKARU' });
});

app.listen(PORT, () => {
  console.log(`🚀 MUCONNECT API running on port ${PORT}`);
});
