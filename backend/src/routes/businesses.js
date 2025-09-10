const express = require('express');
const prisma = require('../prismaClient');
const { authMiddleware } = require('../middlewares/authMiddleware');

const router = express.Router();

// GET /api/businesses/:businessId/data
router.get('/:businessId/data', authMiddleware, async (req, res) => {
  const { businessId } = req.params;
  const user = req.user;
  if (user.role !== 'SuperAdmin' && user.businessId !== Number(businessId)) return res.status(403).json({ error: 'Forbidden' });
  const business = await prisma.business.findUnique({
    where: { id: Number(businessId) },
    include: { clients: true, appointments: true, products: true }
  });
  if (!business) return res.status(404).json({ error: 'Business not found' });
  const plans = await prisma.plan.findMany();
  const subscriptions = await prisma.subscription.findMany({ where: { businessId: Number(businessId) }});
  const payments = await prisma.payment.findMany({ where: { businessId: Number(businessId) }});
  res.json({ business, plans, subscriptions, payments });
});

// PUT profile/prices/theme and sync endpoints
router.put('/:businessId/profile', authMiddleware, async (req, res) => {
  const { businessId } = req.params;
  const user = req.user;
  if (user.role !== 'SuperAdmin' && user.businessId !== Number(businessId)) return res.status(403).json({ error: 'Forbidden' });
  const profile = req.body;
  const b = await prisma.business.update({ where: { id: Number(businessId) }, data: { profile }});
  res.json(b.profile);
});

router.put('/:businessId/prices', authMiddleware, async (req, res) => {
  const { businessId } = req.params;
  const user = req.user;
  if (user.role !== 'SuperAdmin' && user.businessId !== Number(businessId)) return res.status(403).json({ error: 'Forbidden' });
  const prices = req.body;
  const b = await prisma.business.update({ where: { id: Number(businessId) }, data: { prices }});
  res.json(b.prices);
});

router.put('/:businessId/theme', authMiddleware, async (req, res) => {
  const { businessId } = req.params;
  const user = req.user;
  if (user.role !== 'SuperAdmin' && user.businessId !== Number(businessId)) return res.status(403).json({ error: 'Forbidden' });
  const themeSettings = req.body;
  const b = await prisma.business.update({ where: { id: Number(businessId) }, data: { themeSettings }});
  res.json(b.themeSettings);
});

// Sync: replace all appointments
router.put('/:businessId/appointments', authMiddleware, async (req, res) => {
  const { businessId } = req.params;
  const items = req.body;
  const user = req.user;
  if (user.role !== 'SuperAdmin' && user.businessId !== Number(businessId)) return res.status(403).json({ error: 'Forbidden' });
  // transaction: delete old, create new
  await prisma.$transaction([
    prisma.appointment.deleteMany({ where: { businessId: Number(businessId) } }),
    prisma.appointment.createMany({ data: items.map(it => ({ businessId: Number(businessId), clientName: it.clientName || '', services: it.services || {}, date: new Date(it.date), time: it.time || '', status: it.status || 'Scheduled', cost: it.cost || 0 })) })
  ]);
  const saved = await prisma.appointment.findMany({ where: { businessId: Number(businessId) }});
  res.json(saved);
});

router.put('/:businessId/clients', authMiddleware, async (req, res) => {
  const { businessId } = req.params;
  const items = req.body;
  const user = req.user;
  if (user.role !== 'SuperAdmin' && user.businessId !== Number(businessId)) return res.status(403).json({ error: 'Forbidden' });
  await prisma.$transaction([
    prisma.client.deleteMany({ where: { businessId: Number(businessId) } }),
    prisma.client.createMany({ data: items.map(it => ({ businessId: Number(businessId), name: it.name || '', phone: it.phone || '', email: it.email || '', birthDate: it.birthDate ? new Date(it.birthDate) : null, serviceHistory: it.serviceHistory || {}, preferences: it.preferences || '' })) })
  ]);
  const saved = await prisma.client.findMany({ where: { businessId: Number(businessId) }});
  res.json(saved);
});

router.put('/:businessId/products', authMiddleware, async (req, res) => {
  const { businessId } = req.params;
  const items = req.body;
  const user = req.user;
  if (user.role !== 'SuperAdmin' && user.businessId !== Number(businessId)) return res.status(403).json({ error: 'Forbidden' });
  await prisma.$transaction([
    prisma.product.deleteMany({ where: { businessId: Number(businessId) } }),
    prisma.product.createMany({ data: items.map(it => ({ businessId: Number(businessId), name: it.name || '', currentStock: it.currentStock || 0, minStock: it.minStock || 0 })) })
  ]);
  const saved = await prisma.product.findMany({ where: { businessId: Number(businessId) }});
  res.json(saved);
});

module.exports = router;