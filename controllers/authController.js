export const handleGoogleLogin = async (req, res) => {
    try {
      res.json({ message: 'Ruta de login con Google lista para usar ✅' });
    } catch (err) {
      console.error('❌ Error en login Google:', err.message);
      res.status(500).json({ error: 'Error en login con Google' });
    }
  };
  