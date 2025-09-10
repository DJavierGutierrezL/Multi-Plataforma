const express = require('express');
const { authMiddleware, requireRole } = require('../middlewares/authMiddleware');
const prisma = require('../prismaClient');

const router = express.Router();

router.get('/dashboard', authMiddleware, requireRole('SuperAdmin'), async (req, res) => {
  const businesses = await prisma.business.findMany();
  const users = await prisma.user.findMany();
  const plans = await prisma.plan.findMany();
  const subscriptions = await prisma.subscription.findMany();
  const payments = await prisma.payment.findMany();
  res.json({ businesses, users, plans, subscriptions, payments });
});

module.exports = router;