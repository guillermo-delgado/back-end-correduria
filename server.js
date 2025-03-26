import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import OpenAI from "openai";
import mongoose from "mongoose";
import Session from "./models/Session.js";

dotenv.config();
console.log("🔐 URI MONGO:", process.env.MONGO_URI);

const app = express();
app.use(cors());
app.use(express.json());

// Conexión a MongoDB
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("✅ Conectado a MongoDB"))
  .catch((err) => console.error("❌ Error conectando a MongoDB", err));

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const systemPrompt = {
  role: "system",
  content:
    "Eres un corredor de seguros profesional con amplia experiencia. Ofreces asesoramiento experto, claro y cercano sobre seguros de coche, hogar, vida, salud y negocios. Siempre preguntas lo necesario para entender al cliente y recomendar la mejor opción.",
};

// Ruta principal del chat
app.post("/api/chat", async (req, res) => {
  try {
    const { message, sessionId } = req.body;
    console.log("🛰️ Mensaje recibido:", message);
    console.log("🧾 SessionId recibido:", sessionId);
    
    if (!sessionId) {
      return res.status(400).json({ error: "Falta sessionId" });
    }

    // Buscar la sesión en MongoDB
    let session = await Session.findOne({ sessionId });

    // Si no existe, crearla con el systemPrompt inicial
    if (!session) {
      console.log("🆕 No existe sesión, se crea una nueva");

      session = new Session({
        sessionId,
        messages: [systemPrompt],
      });
    } else {
      console.log("📂 Sesión encontrada:", sessionId);
    }

    // Añadir mensaje del usuario al historial
    session.messages.push({ role: "user", content: message });

    // LOG para verificar qué se envía a OpenAI
    console.log("📤 Enviando historial a OpenAI:");
    console.log(JSON.stringify(session.messages, null, 2));

    const chatCompletion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: session.messages,
    });

    const reply = chatCompletion.choices[0].message;

    // Añadir respuesta al historial
    session.messages.push(reply);

    // Guardar en MongoDB
    await session.save();

    console.log("💾 Sesión guardada:", session.sessionId);
    console.log("🤖 Respuesta:", reply.content);

    res.json({ reply: reply.content });
  } catch (error) {
    console.error("❌ Error al generar respuesta:", error.message);
    res.status(500).json({ error: "Error al generar respuesta" });
  }
});

// Ruta para ver historial de una sesión
app.get("/api/history/:sessionId", async (req, res) => {
  try {
    const { sessionId } = req.params;

    const session = await Session.findOne({ sessionId });
    if (!session) {
      return res.status(404).json({ error: "No existe historial para ese sessionId" });
    }

    res.json({ sessionId: session.sessionId, history: session.messages });
  } catch (error) {
    res.status(500).json({ error: "Error al recuperar historial" });
  }
});

// Ruta de depuración para listar todas las sesiones
app.get("/api/debug/sessions", async (req, res) => {
  try {
    const sessions = await Session.find({}, "sessionId messages").lean();
    res.json(sessions);
  } catch (err) {
    res.status(500).json({ error: "Error al recuperar sesiones" });
  }
});

// Iniciar servidor
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`✅ Servidor backend escuchando en http://localhost:${PORT}`);
});
