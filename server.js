import express from "express";
import cors from "cors";
import dotenv from "dotenv";
// import OpenAI from "openai";
import mongoose from "mongoose";
import authRoutes from "./routes/auth.js";
import chatRoutes from './routes/chat.js';
import Session from "./models/Session.js";
import historyRoutes from './routes/history.js'; 
import cors from "cors";
// import { marked } from "marked";


// ✅ Configura CORS correctamente
const allowedOrigins = [
  "http://localhost:3000",
  "http://localhost:5173",
  "https://correduria-gabn.vercel.app",
];


dotenv.config(); // 👈 justo después
const app = express();
app.use(cors());
app.use(express.json());
app.use(
  cors({
    origin: allowedOrigins,
    credentials: true, // si usas cookies o sesiones
  })
);


// 🆕 rutas
app.use("/api/auth", authRoutes);
app.use("/api/chat", chatRoutes);
app.use("/api/history", historyRoutes);



;
console.log("🔐 URI MONGO:", process.env.MONGO_URI);



// No establecer COOP/COEP a menos que sea estrictamente necesario
// app.use((req, res, next) => {
//   res.setHeader('Cross-Origin-Opener-Policy', 'same-origin');
//   res.setHeader('Cross-Origin-Embedder-Policy', 'require-corp');
//   next();
// });




// Conexión a MongoDB
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("✅ Conectado a MongoDB"))
  .catch((err) => console.error("❌ Error conectando a MongoDB", err));

// const openai = new OpenAI({
//   apiKey: process.env.OPENAI_API_KEY,
// });

// const systemPrompt = {
//   role: "system",
//   content:
//     "Eres un corredor de seguros profesional con amplia experiencia. Puedes usar listas y tablas en HTML si es útil para responder de forma clara. Si no es necesario das respuestas concisas y cortas, Ofreces asesoramiento experto, claro y cercano sobre seguros de coche, hogar, vida, salud y negocios. Siempre preguntas lo necesario para entender al cliente y recomendar la mejor opción.",
// };

// Ruta principal del chat
// app.post("/api/chat", async (req, res) => {
//   try {
//     const { message, sessionId } = req.body;
//     console.log("🛰️ Mensaje recibido:", message);
//     console.log("🧾 SessionId recibido:", sessionId);

//     if (!sessionId) {
//       return res.status(400).json({ error: "Falta sessionId" });
//     }

//     let session = await Session.findOne({ sessionId });

//     if (!session) {
//       console.log("🆕 No existe sesión, se crea una nueva");
//       session = new Session({
//         sessionId,
//         messages: [systemPrompt],
//       });
//     } else {
//       console.log("📂 Sesión encontrada:", sessionId);
//     }

//     session.messages.push({ role: "user", content: message });

//     console.log("📤 Enviando historial a OpenAI:");
//     console.log(JSON.stringify(session.messages.slice(-10), null, 2));

    // const chatCompletion = await openai.chat.completions.create({
    //   model: "gpt-3.5-turbo",
    //   messages: session.messages.slice(-10),
    // });

    // const reply = chatCompletion.choices[0].message;
    // const htmlContent = marked(reply.content);

    // session.messages.push({
    //   role: "assistant",
    //   content: htmlContent,
    // });

    // await session.save();

    // console.log("💾 Sesión guardada:", session.sessionId);
    // console.log("🤖 Respuesta:", reply.content);

//     res.json({ reply: htmlContent });
//   } catch (error) {
//     console.error("❌ Error al generar respuesta:", error.message);
//     res.status(500).json({ error: "Error al generar respuesta" });
//   }
// });

// Ruta para ver historial de una sesión
app.get("/api/history/:sessionId", async (req, res) => {
  try {
    const { sessionId } = req.params;

    const session = await Session.findOne({ sessionId });
    if (!session) {
      return res
        .status(404)
        .json({ error: "No existe historial para ese sessionId" });
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
