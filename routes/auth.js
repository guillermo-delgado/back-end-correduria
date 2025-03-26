import express from 'express';
import passport from 'passport';

export const authRoutes = express.Router();

// Ruta de prueba
authRoutes.get('/ping', (req, res) => {
  res.send('pong ✅');
});

// 🔐 Iniciar sesión con Google
authRoutes.get('/google', passport.authenticate('google', {
  scope: ['profile', 'email']
}));

// 🔄 Callback después de iniciar sesión con Google
authRoutes.get('/google/callback',
  passport.authenticate('google', {
    successRedirect: '/',          // puedes cambiar esta ruta
    failureRedirect: '/login-failed'
  })
);

// 🔓 Logout
authRoutes.get('/logout', (req, res) => {
  req.logout(() => {
    res.redirect('/');
  });
});
