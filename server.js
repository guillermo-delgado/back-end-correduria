import express from "express";
import dotenv from "dotenv";
import mongoose from "mongoose";
import authRoutes from "./routes/auth.js";
import chatRoutes from "./routes/chat.js";
import Session from "./models/Session.js";
import historyRoutes from "./routes/history.js";

dotenv.config();
const app = express();
app.use(express.json());

// ✅ Lista de orígenes permitidos
const allowedOrigins = [
  "http://localhost:5173",
  "http://localhost:3000",
  "https://correduria.vercel.app",
  "https://correduria-gabn.vercel.app",
];

// ✅ Middleware CORS personalizado
app.use((req, res, next) => {
  const origin = req.headers.origin;
  if (origin && allowedOrigins.includes(origin)) {
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

// ✅ Log de peticiones entrantes
app.use((req, res, next) => {
  console.log(`🛬 [${req.method}] ${req.originalUrl}`);
  next();
});

// ✅ Rutas principales
app.use("/api/auth", authRoutes);
app.use("/api/chat", chatRoutes);
app.use("/api/history", historyRoutes);

// ✅ Ruta de prueba
app.get("/api/ping", (req, res) => {
  console.log("✅ Recibido ping");
  res.json({ message: "pong" });
});

// ✅ Ruta directa para historial por sessionId (fallback si no está en el archivo de rutas)
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

// ✅ Ruta debug de sesiones guardadas
app.get("/api/debug/sessions", async (req, res) => {
  try {
    const sessions = await Session.find({}, "sessionId messages").lean();
    res.json(sessions);
  } catch (err) {
    res.status(500).json({ error: "Error al recuperar sesiones" });
  }
});

// ✅ Conexión a MongoDB
console.log("🔐 URI MONGO:", process.env.MONGO_URI);
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("✅ Conectado a MongoDB"))
  .catch((err) => console.error("❌ Error conectando a MongoDB", err));

// 🚀 Lanzar servidor
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`✅ Servidor backend escuchando en http://localhost:${PORT}`);
});
