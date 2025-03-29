import dotenv from 'dotenv';
dotenv.config(); // 👈 Esto debe ir antes de usar process.env

import express from 'express';
import Session from '../models/Session.js';
import { marked } from 'marked';
import OpenAI from 'openai';

const router = express.Router();

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY, // ✅ Ya debería estar disponible
});

const systemPrompt = {
  role: "system",
  content: "Eres un corredor de seguros profesional con amplia experiencia. Puedes usar listas y tablas en HTML si es útil para responder de forma clara. Si no es necesario das respuestas concisas y cortas, Ofreces asesoramiento experto, claro y cercano sobre seguros de coche, hogar, vida, salud y negocios. Siempre preguntas lo necesario para entender al cliente y recomendar la mejor opción.",
};

router.post('/', async (req, res) => {
  try {
    const { message, sessionId, userId } = req.body;

    if (!sessionId || !userId) {
      return res.status(400).json({ error: "Faltan datos" });
    }

    let session = await Session.findOne({ sessionId });

    if (!session) {
      session = new Session({
        sessionId,
        userId,
        messages: [systemPrompt],
      });
    }

    session.messages.push({ role: "user", content: message });

    const chatCompletion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: session.messages.slice(-10),
    });

    const reply = chatCompletion.choices[0].message;
    const htmlContent = marked(reply.content);

    session.messages.push({ role: "assistant", content: htmlContent });
    await session.save();

    res.json({ reply: htmlContent });
  } catch (error) {
    console.error("❌ Chat error:", error);
    res.status(500).json({ error: "Error al procesar el mensaje" });
  }
});

export default router;
