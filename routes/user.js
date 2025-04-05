import express from 'express';
import User from '../models/User.js';
import Session from '../models/Session.js';

const router = express.Router();

// 🐞 DEBUG: Obtener y mostrar sesiones de un usuario por su userId
router.get('/debug/sesiones/:userId', async (req, res) => {
    const userId = req.params.userId;
    console.log("📥 Consultando sesiones del usuario:", userId);
  
    try {
      const sesiones = await Session.find({ userId }).lean();
      console.log("🧾 Sesiones encontradas:", sesiones);
  
      res.json({ sesiones });
    } catch (err) {
      console.error('❌ Error al obtener sesiones:', err);
      res.status(500).json({ error: 'Error interno' });
    }
  });
  
  // 🧹 Ruta para limpiar conversaciones inválidas
  router.delete('/clean-conversaciones/:userId', async (req, res) => {
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

export default router;
