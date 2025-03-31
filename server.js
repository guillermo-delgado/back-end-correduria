import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import mongoose from "mongoose";
import authRoutes from "./routes/auth.js";
import chatRoutes from "./routes/chat.js";
import Session from "./models/Session.js";
import historyRoutes from "./routes/history.js";

dotenv.config();
const app = express();

// ✅ Permitir orígenes específicos
const allowedOrigins = [
  "http://localhost:3000",
  "http://localhost:5173",
  "https://correduria-gabn.vercel.app",
];

// ✅ Logs básicos
app.use(express.json());
app.use((req, res, next) => {
  console.log(`🛬 [${req.method}] ${req.originalUrl}`);
  next();
});

// ✅ Middleware manual para CORS + preflight
app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "https://correduria-gabn.vercel.app");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  res.setHeader("Access-Control-Allow-Credentials", "true");

  if (req.method === "OPTIONS") {
    console.log("⚙️ Preflight OPTIONS recibido en:", req.originalUrl);
    return res.sendStatus(200);
  }

  next();
});

// ✅ CORS formal
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

// ✅ Fallback global para OPTIONS (por si acaso)
app.options("*", cors());

// ✅ Ruta de salud/ping
app.get("/api/ping", (req, res) => {
  console.log("✅ Recibido ping");
  res.json({ message: "pong", origin: req.headers.origin || "desconocido" });
});

// ✅ Rutas reales
app.use("/api/auth", authRoutes);
app.use("/api/chat", chatRoutes);
app.use("/api/history", historyRoutes);

// 🔌 Conexión a Mongo
console.log("🔐 URI MONGO:", process.env.MONGO_URI);
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("✅ Conectado a MongoDB"))
  .catch((err) => console.error("❌ Error conectando a MongoDB", err));

// 🧠 Historial individual
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

// 🛠️ Depurar todas las sesiones
app.get("/api/debug/sessions", async (req, res) => {
  try {
    const sessions = await Session.find({}, "sessionId messages").lean();
    res.json(sessions);
  } catch (err) {
    res.status(500).json({ error: "Error al recuperar sesiones" });
  }
});

// 🚀 Servidor
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`✅ Servidor backend escuchando en http://localhost:${PORT}`);
});
