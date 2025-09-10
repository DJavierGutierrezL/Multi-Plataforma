const express = require('express');
const bcrypt = require('bcrypt');
const prisma = require('../prismaClient');
const { sign } = require('../utils/jwt');

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
  res.json({ token, user: { id: user.id, username: user.username, role: user.role, firstName: user.firstName, lastName: user.lastName, businessId: user.businessId } });
});

// POST /api/auth/register
router.post('/register', async (req, res) => {
  const data = req.body;
  // Expected: registration data containing business and initial user fields.
  // Minimal validation:
  if (!data.business || !data.user) return res.status(400).json({ error: 'Invalid payload. Expect { business, user }' });
  const t = await prisma.$transaction(async (prismaTx) => {
    // create plan if not exists (basic)
    let basicPlan = await prismaTx.plan.findFirst({ where: { name: 'Basic' } });
    if (!basicPlan) {
      basicPlan = await prismaTx.plan.create({ data: { name: 'Basic', price: 0, features: [] } });
    }
    const business = await prismaTx.business.create({
      data: {
        type: data.business.type || 'Default',
        profile: data.business.profile || {},
        prices: data.business.prices || {},
        themeSettings: data.business.themeSettings || {}
      }
    });
    const hashed = await bcrypt.hash(data.user.password, 10);
    const user = await prismaTx.user.create({
      data: {
        firstName: data.user.firstName || '',
        lastName: data.user.lastName || '',
        phone: data.user.phone || '',
        username: data.user.username,
        email: data.user.email,
        password: hashed,
        role: data.user.role || 'User',
        businessId: business.id
      }
    });
    const now = new Date();
    const sub = await prismaTx.subscription.create({
      data: {
        businessId: business.id,
        planId: basicPlan.id,
        status: 'Trial',
        startDate: now,
        endDate: new Date(now.getTime() + 14*24*60*60*1000)
      }
    });
    await prismaTx.payment.create({
      data: {
        businessId: business.id,
        amount: 0,
        date: now,
        planName: basicPlan.name
      }
    });
    return { business, user };
  });
  const token = sign({ id: t.user.id, role: t.user.role, businessId: t.user.business.id });
  res.status(201).json({ token, user: { id: t.user.id, username: t.user.username, role: t.user.role, businessId: t.user.business.id }});
});

module.exports = router;