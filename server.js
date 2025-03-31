import express from "express";
import cors from "cors";
import dotenv from "dotenv";
// import OpenAI from "openai";
import mongoose from "mongoose";
import authRoutes from "./routes/auth.js";
import chatRoutes from './routes/chat.js';
import Session from "./models/Session.js";
import historyRoutes from './routes/history.js';
// import { marked } from "marked";

// ✅ CORS: Orígenes permitidos
const allowedOrigins = [
  "http://localhost:3000",
  "http://localhost:5173",
  "https://correduria-gabn.vercel.app",
];

dotenv.config();
const app = express();

app.use(express.json());

// ✅ Middleware para preflight OPTIONS + headers básicos CORS
app.use((req, res, next) => {
  const origin = req.headers.origin;
  if (allowedOrigins.includes(origin)) {
    res.setHeader("Access-Control-Allow-Origin", origin);
  }

  res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  res.setHeader("Access-Control-Allow-Credentials", "true");

  if (req.method === "OPTIONS") {
    return res.sendStatus(200);
  }

  next();
});

// ✅ Solo se mantiene UN cors() real (para la verificación formal)
app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        console.warn("❌ Origen bloqueado por CORS:", origin);
        callback(new Error("CORS not allowed from this origin"));
      }
    },
    credentials: true,
  })
);

// ✅ Rutas
app.use("/api/auth", authRoutes);
app.use("/api/chat", chatRoutes);
app.use("/api/history", historyRoutes);

console.log("🔐 URI MONGO:", process.env.MONGO_URI);

// 🔌 MongoDB
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("✅ Conectado a MongoDB"))
  .catch((err) => console.error("❌ Error conectando a MongoDB", err));

// 🧠 Ruta para historial de sesiones
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

// 🛠️ Debug sesiones
app.get("/api/debug/sessions", async (req, res) => {
  try {
    const sessions = await Session.find({}, "sessionId messages").lean();
    res.json(sessions);
  } catch (err) {
    res.status(500).json({ error: "Error al recuperar sesiones" });
  }
});

// 🚀 Lanzar servidor
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`✅ Servidor backend escuchando en http://localhost:${PORT}`);
});
