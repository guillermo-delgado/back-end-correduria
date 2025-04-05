// 📁 routes/history.js
import express from 'express';
import Session from '../models/Session.js';
import User from '../models/User.js'; // ✅ Importamos el modelo de usuario

const router = express.Router();

// ✅ Obtener historial de una sesión por sessionId (colección Session)
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

// ✅ Nuevo endpoint: obtener historial desde el modelo User por userId
router.get('/user/:userId', async (req, res) => {
  try {
    const { userId } = req.params;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }

    res.json({ userId: user._id, conversaciones: user.conversaciones || [] });
  } catch (error) {
    console.error('❌ Error al recuperar historial del usuario:', error);
    res.status(500).json({ error: 'Error al recuperar historial del usuario' });
  }
});

// ⚠️ Ruta de borrado masivo — solo usar para pruebas
router.delete('/delete-all-sessions', async (req, res) => {
  try {
    const result = await Session.deleteMany({});
    res.json({ success: true, deletedCount: result.deletedCount });
  } catch (error) {
    console.error("❌ Error borrando sesiones:", error);
    res.status(500).json({ error: "Error al borrar las sesiones" });
  }
});

export default router;
