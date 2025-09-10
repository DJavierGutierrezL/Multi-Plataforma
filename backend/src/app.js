const express = require('express');
const cors = require('cors');
const authRoutes = require('./routes/auth');
const businessRoutes = require('./routes/businesses');
const adminRoutes = require('./routes/admin');
const subscriptionRoutes = require('./routes/subscriptions');

const app = express();

// 👇 Usa la URL definida en .env o, por defecto, la de Vite (5173)
const FRONTEND = process.env.FRONTEND_URL || 'http://localhost:5173';

app.use(cors({
  origin: FRONTEND,
  credentials: true, // habilita cookies/sesiones si más adelante usas auth por JWT o cookies
}));

app.use(express.json({ limit: '5mb' }));

// Rutas
app.use('/api/auth', authRoutes);
app.use('/api/businesses', businessRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/subscriptions', subscriptionRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ ok: true, time: new Date() });
});

module.exports = app;
