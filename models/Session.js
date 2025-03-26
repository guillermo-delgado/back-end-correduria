import mongoose from "mongoose";

// Cada mensaje tiene un rol (user/assistant/system) y un contenido de texto
const messageSchema = new mongoose.Schema({
  role: { type: String, required: true },
  content: { type: String, required: true },
});

// Cada sesión tiene un ID único y un array de mensajes
const sessionSchema = new mongoose.Schema({
  sessionId: { type: String, required: true, unique: true },
  messages: [messageSchema],
}, { timestamps: true });

export default mongoose.model("Session", sessionSchema);
