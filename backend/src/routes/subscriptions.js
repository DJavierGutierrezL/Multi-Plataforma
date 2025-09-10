const express = require('express');
const { authMiddleware, requireRole } = require('../middlewares/authMiddleware');
const prisma = require('../prismaClient');

const router = express.Router();

router.put('/:subscriptionId/status', authMiddleware, requireRole('SuperAdmin'), async (req, res) => {
  const { subscriptionId } = req.params;
  const { status } = req.body;
  const updated = await prisma.subscription.update({ where: { id: Number(subscriptionId) }, data: { status }});
  res.json(updated);
});

router.post('/change-plan', authMiddleware, async (req, res) => {
  const { businessId, newPlanId } = req.body;
  const user = req.user;
  if (user.role !== 'SuperAdmin' && user.businessId !== Number(businessId)) return res.status(403).json({ error: 'Forbidden' });
  const now = new Date();
  const sub = await prisma.subscription.updateMany({ where: { businessId: Number(businessId) }, data: { planId: Number(newPlanId) }});
  const plan = await prisma.plan.findUnique({ where: { id: Number(newPlanId) }});
  const payment = await prisma.payment.create({ data: { businessId: Number(businessId), amount: plan ? plan.price : 0, date: now, planName: plan ? plan.name : 'Changed' }});
  res.json({ updatedSubscriptionCount: sub.count, newPayment: payment });
});

router.post('/renew', authMiddleware, async (req, res) => {
  const { businessId } = req.body;
  const user = req.user;
  if (user.role !== 'SuperAdmin' && user.businessId !== Number(businessId)) return res.status(403).json({ error: 'Forbidden' });
  const subs = await prisma.subscription.findMany({ where: { businessId: Number(businessId) }});
  const now = new Date();
  const results = [];
  for (const s of subs) {
    const upd = await prisma.subscription.update({ where: { id: s.id }, data: { startDate: now, endDate: new Date(now.getTime() + 30*24*60*60*1000), status: 'Active' }});
    const plan = await prisma.plan.findUnique({ where: { id: upd.planId }});
    const payment = await prisma.payment.create({ data: { businessId: Number(businessId), amount: plan ? plan.price : 0, date: now, planName: plan ? plan.name : 'Renew' }});
    results.push({ updated: upd, payment });
  }
  res.json({ results });
});

module.exports = router;