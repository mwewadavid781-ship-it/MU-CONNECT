
const express = require('express');
const router = express.Router();
const Groq = require('groq-sdk');

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

router.post('/chat', async (req, res) => {
  try {
    const { message, context } = req.body;

    if (!message) {
      return res.status(400).json({ error: 'Message content is required.' });
    }

    const completion = await groq.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      messages: [
        {
          role: 'system',
          content: 'You are Muconnect AI, AHAK DEV \'s friendly assistant for all  Universities  marketplace. Help buyers find products/food and help sellers setup stores.'
        },
        {
          role: 'user',
          content: message
        }
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

module.exports = router;
