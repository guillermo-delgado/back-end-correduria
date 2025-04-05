import dotenv from 'dotenv';
dotenv.config(); // 👈 Esto debe ir antes de usar process.env

import express from 'express';
import Session from '../models/Session.js';
import User from '../models/User.js';
import { marked } from 'marked';
import OpenAI from 'openai';

const router = express.Router();

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const systemPrompt = {
  role: "system",
  content: "Eres un corredor de seguros profesional con amplia experiencia. Puedes usar listas y tablas en HTML si es útil para responder de forma clara. Si no es necesario das respuestas concisas y cortas. Ofreces asesoramiento experto, claro y cercano sobre seguros de coche, hogar, vida, salud y negocios. Siempre preguntas lo necesario para entender al cliente y recomendar la mejor opción.",
};

// ⚠️ Ruta solo para pruebas
router.delete('/user/clean-conversaciones/:userId', async (req, res) => {
  try {
    const user = await User.findById(req.params.userId);
    if (!user) return res.status(404).json({ error: 'Usuario no encontrado' });

    user.conversaciones = user.conversaciones.filter(conv =>
      conv.question && conv.answer
    );

    await user.save();
    res.json({ success: true, total: user.conversaciones.length });
  } catch (err) {
    console.error('❌ Error limpiando conversaciones:', err);
    res.status(500).json({ error: 'Error al limpiar' });
  }
});

// 🔄 Ruta para obtener todas las conversaciones del usuario
router.get('/user/sessions/:userId', async (req, res) => {
  try {
    const user = await User.findById(req.params.userId);
    if (!user) return res.status(404).json({ error: 'Usuario no encontrado' });
    res.json({ sesiones: user.conversaciones || [] });
  } catch (err) {
    console.error('❌ Error recuperando sesiones:', err);
    res.status(500).json({ error: 'Error al recuperar sesiones' });
  }
});

router.post('/', async (req, res) => {
  try {
    const { message, sessionId, userId } = req.body;

    if (!sessionId || !userId) {
      return res.status(400).json({ error: "Faltan datos" });
    }

    let session = await Session.findOne({ sessionId });

    if (!session) {
      const cantidadSesiones = await Session.countDocuments({ userId });
    
      session = new Session({
        sessionId,
        userId,
        name: `Asistente ${cantidadSesiones + 1}`, // ✅ nombre único guardado
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

    // ✅ Guardar también en el usuario autenticado
    try {
      const user = await User.findById(userId);
    
      if (!user) {
        console.log("⚠️ Usuario no encontrado:", userId);
      } else {
        console.log("✅ Usuario encontrado:", user.email);
    
        const yaExiste = user.conversaciones.some(c => c.sessionId === sessionId);
        console.log("¿Ya existe esta sesión en el user?", yaExiste);
    
        if (!yaExiste) {
          user.conversaciones.push({
            sessionId,
            question: message,
            answer: htmlContent,
            fecha: new Date(),
          });
          await user.save();
          console.log("✅ Conversación añadida al usuario");
        } else {
          console.log("⏩ Conversación ya estaba guardada");
        }
      }
    } catch (err) {
      console.warn("❌ Error actualizando el user:", err.message);
    }
    
    

    res.json({ reply: htmlContent });
  } catch (error) {
    console.error("❌ Chat error:", error);
    res.status(500).json({ error: "Error al procesar el mensaje" });
  }
});

export default router;
