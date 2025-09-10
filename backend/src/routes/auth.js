const express = require('express');
const bcrypt = require('bcryptjs');
const prisma = require('../prismaClient');
const { sign, verify } = require('../utils/jwt');

const router = express.Router();

// POST /api/auth/login
router.post('/login', async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) return res.status(400).json({ error: 'Missing credentials' });

  const user = await prisma.user.findUnique({ where: { username } });
  if (!user) return res.status(401).json({ error: 'Invalid credentials' });

  const match = await bcrypt.compare(password, user.password);
  if (!match) return res.status(401).json({ error: 'Invalid credentials' });

  const token = sign({ id: user.id, role: user.role, businessId: user.businessId });

  res.json({
    token,
    user: {
      id: user.id,
      username: user.username,
      role: user.role,
      firstName: user.firstName,
      lastName: user.lastName,
      businessId: user.businessId,
    },
  });
});

// POST /api/auth/register
router.post('/register', async (req, res) => {
  const data = req.body;

  if (!data.business || !data.user) {
    return res.status(400).json({ error: 'Invalid payload. Expect { business, user }' });
  }

  try {
    const t = await prisma.$transaction(async (prismaTx) => {
      // Buscar o crear plan básico
      let basicPlan = await prismaTx.plan.findFirst({ where: { name: 'Basic' } });
      if (!basicPlan) {
        basicPlan = await prismaTx.plan.create({
          data: { name: 'Basic', price: 0, features: [] },
        });
      }

      // Crear negocio
      const business = await prismaTx.business.create({
        data: {
          type: data.business.type || 'Default',
          profile: data.business.profile || {},
          prices: data.business.prices || {},
          themeSettings: data.business.themeSettings || {},
        },
      });

      // Hashear contraseña
      const hashed = await bcrypt.hash(data.user.password, 10);

      // Crear usuario
      const user = await prismaTx.user.create({
        data: {
          firstName: data.user.firstName || '',
          lastName: data.user.lastName || '',
          phone: data.user.phone || '',
          username: data.user.username,
          email: data.user.email,
          password: hashed,
          role: data.user.role || 'USER', // Enum seguro (SUPERADMIN | ADMIN | USER)
          businessId: business.id,
        },
      });

      // Crear suscripción
      const now = new Date();
      const sub = await prismaTx.subscription.create({
        data: {
          businessId: business.id,
          planId: basicPlan.id,
          status: 'Trial',
          startDate: now,
          endDate: new Date(now.getTime() + 14 * 24 * 60 * 60 * 1000), // 14 días
        },
      });

      // Crear pago vinculado a la suscripción
      await prismaTx.payment.create({
        data: {
          businessId: business.id,
          subscriptionId: sub.id,
          amount: 0,
          date: now,
          planName: basicPlan.name,
        },
      });

      return { business, user };
    });

    const token = sign({
      id: t.user.id,
      role: t.user.role,
      businessId: t.business.id,
    });

    res.status(201).json({
      token,
      user: {
        id: t.user.id,
        username: t.user.username,
        role: t.user.role,
        businessId: t.business.id,
      },
    });
  } catch (err) {
    console.error('Register error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/auth/me
router.get('/me', async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) return res.status(401).json({ error: 'No token provided' });

    const token = authHeader.split(' ')[1];
    const decoded = verify(token); // decodifica y valida el token

    const user = await prisma.user.findUnique({
      where: { id: decoded.id },
      select: {
        id: true,
        username: true,
        role: true,
        firstName: true,
        lastName: true,
        businessId: true,
      },
    });

    if (!user) return res.status(404).json({ error: 'User not found' });

    res.json({ user });
  } catch (err) {
    console.error('Me error:', err);
    res.status(401).json({ error: 'Invalid token' });
  }
});

module.exports = router;
