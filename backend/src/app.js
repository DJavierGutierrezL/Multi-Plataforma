// app.js
const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const { PrismaClient } = require('@prisma/client');
const path = require('path');

const authRoutes = require('./routes/auth');
const businessRoutes = require('./routes/businesses');
const adminRoutes = require('./routes/admin');
const subscriptionRoutes = require('./routes/subscriptions');

const app = express();
const prisma = new PrismaClient();

// 👇 URL de tu frontend en desarrollo (Vite)
const FRONTEND = process.env.FRONTEND_URL || 'http://localhost:5173';

app.use(cors({
  origin: FRONTEND,
  credentials: true,
}));

app.use(express.json({ limit: '5mb' }));

// =======================
// Rutas principales / API
// =======================
app.use('/api/auth', authRoutes);
app.use('/api/businesses', businessRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/subscriptions', subscriptionRoutes);

// =======================
// CRUD de Usuarios
// =======================

// GET todos los usuarios
app.get('/api/users', async (req, res) => {
  try {
    const users = await prisma.user.findMany({
      select: { id: true, name: true, email: true, role: true, createdAt: true }
    });
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST crear usuario
app.post('/api/users', async (req, res) => {
  try {
    const { name, email, password } = req.body;
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ error: 'El email ya está registrado' });
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = await prisma.user.create({
      data: { name, email, password: hashedPassword },
      select: { id: true, name: true, email: true, role: true, createdAt: true }
    });
    res.json(newUser);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// PUT actualizar usuario
app.put('/api/users/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email, password } = req.body;
    let data = { name, email };
    if (password) {
      const hashedPassword = await bcrypt.hash(password, 10);
      data.password = hashedPassword;
    }
    const updatedUser = await prisma.user.update({
      where: { id: parseInt(id) },
      data,
      select: { id: true, name: true, email: true, role: true, createdAt: true }
    });
    res.json(updatedUser);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// DELETE eliminar usuario
app.delete('/api/users/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await prisma.user.delete({ where: { id: parseInt(id) } });
    res.json({ message: 'Usuario eliminado' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// =======================
// Health check
// =======================
app.get('/api/health', (req, res) => {
  res.json({ ok: true, time: new Date() });
});

// =======================
// Servir frontend compilado
// =======================
const FRONTEND_BUILD_PATH = path.join(__dirname, '../frontend/dist');
app.use(express.static(FRONTEND_BUILD_PATH));

// Para cualquier ruta que no sea /api, devolver index.html
app.get('*', (req, res) => {
  res.sendFile(path.join(FRONTEND_BUILD_PATH, 'index.html'));
});

module.exports = app;
