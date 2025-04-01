// 📁 routes/history.js
import express from 'express';
import Session from '../models/Session.js';

const router = express.Router();

// Obtener historial de una sesión por sessionId
router.get('/:sessionId', async (req, res) => {
  try {
    const { sessionId } = req.params;

    const session = await Session.findOne({ sessionId });
    if (!session) {
      return res.status(404).json({ error: 'No existe historial para ese sessionId' });
    }

    res.json({ sessionId: session.sessionId, history: session.messages });
  } catch (error) {
    console.error('❌ Error al recuperar historial:', error);
    res.status(500).json({ error: 'Error al recuperar historial' });
  }
});

export default router;
