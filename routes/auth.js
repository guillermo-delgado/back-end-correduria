import express from "express";
import { OAuth2Client } from "google-auth-library";
import User from "../models/User.js";

const router = express.Router();

const client = new OAuth2Client("945516481273-r5af5fsg05r3f242l92o45c3qge7mg5c.apps.googleusercontent.com");

// LOGIN CON GOOGLE
router.post("/google", async (req, res) => {
  const { token } = req.body;

  try {
    const ticket = await client.verifyIdToken({
      idToken: token,
      audience: client._clientId,
    });

    const payload = ticket.getPayload();
    if (!payload) return res.status(401).json({ error: "Token inválido" });

    const { sub, email, name, picture } = payload;

    let user = await User.findOne({ email });

    if (!user) {
      user = new User({
        googleId: sub,
        email,
        nombre: name,
        avatar: picture,
        createdAt: new Date(),
      });
      await user.save();
    } else {
      if (!user.googleId) user.googleId = sub;
      if (!user.avatar && picture) user.avatar = picture;
      await user.save();
    }

    res.json({ user });
  } catch (err) {
    console.error("Error autenticando token de Google:", err);
    res.status(500).json({ error: "Error verificando token" });
  }
});

// ACTUALIZAR PERFIL DEL USUARIO
router.put("/update", async (req, res) => {
  try {
    const { email, apellidos, telefono, dni, fechaNacimiento } = req.body;

    if (!email) {
      return res.status(400).json({ error: "Email obligatorio para actualizar usuario." });
    }

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ error: "Usuario no encontrado." });
    }

    // Actualizar campos si se reciben
    if (apellidos) user.apellidos = apellidos;
    if (telefono) user.telefono = telefono;
    if (dni) user.dni = dni;
    if (fechaNacimiento) user.fechaNacimiento = new Date(fechaNacimiento);

    await user.save();
    res.json({ user });
  } catch (err) {
    console.error("Error al actualizar usuario:", err);
    res.status(500).json({ error: "Error al actualizar usuario" });
  }
});

// LOGOUT
router.post("/logout", (req, res) => {
  res.json({ message: "Sesión cerrada correctamente." });
});

export default router;
