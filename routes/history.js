import express from "express";
import Session from "../models/Session.js";

const router = express.Router();

// ✅ Obtener TODAS las sesiones (debug)
router.get("/", async (req, res) => {
  try {
    const sessions = await Session.find().sort({ createdAt: -1 }).limit(10).lean();
    res.json(sessions);
  } catch (error) {
    console.error("❌ Error al obtener sesiones:", error);
    res.status(500).json({ error: "Error al obtener sesiones" });
  }
});

// ✅ Obtener historial por sessionId
router.get("/:sessionId", async (req, res) => {
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

export default router;
