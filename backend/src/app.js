const express = require('express');
const cors = require('cors');
const authRoutes = require('./routes/auth');
const businessRoutes = require('./routes/businesses');
const adminRoutes = require('./routes/admin');
const subscriptionRoutes = require('./routes/subscriptions');

const app = express();

const FRONTEND = process.env.FRONTEND_URL || 'http://localhost:3000';
app.use(cors({ origin: FRONTEND }));
app.use(express.json({ limit: '5mb' }));

app.use('/api/auth', authRoutes);
app.use('/api/businesses', businessRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/subscriptions', subscriptionRoutes);

app.get('/api/health', (req, res) => {
  res.json({ ok: true, time: new Date() });
});

module.exports = app;