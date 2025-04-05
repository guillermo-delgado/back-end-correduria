// back-end/models/User.js
import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  googleId: { type: String, default: null },
  appleId: { type: String, default: null },
  email: { type: String, required: true, unique: true },
  nombre: { type: String },
  apellidos: { type: String },
  telefono: { type: String },
  dni: { type: String },
  fechaNacimiento: { type: Date },
  avatar: { type: String },
  conversaciones: [{
    sessionId: { type: String },
    resumen: { type: String },
    fecha: { type: Date, default: Date.now }
  }],
  createdAt: { type: Date, default: Date.now }
});

const User = mongoose.model('User', userSchema);
export default User;
