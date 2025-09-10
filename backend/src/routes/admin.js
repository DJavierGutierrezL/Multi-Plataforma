const express = require('express');
const { authMiddleware, requireRole } = require('../middlewares/authMiddleware');
const prisma = require('../prismaClient');

const router = express.Router();

// GET dashboard completo para SuperAdmin
router.get('/dashboard', authMiddleware, requireRole('SuperAdmin'), async (req, res) => {
  try {
    const businesses = await prisma.business.findMany();
    const users = await prisma.user.findMany();
    const plans = await prisma.plan.findMany();
    const subscriptions = await prisma.subscription.findMany();
    const payments = await prisma.payment.findMany();

    // Nos aseguramos de que profile nunca sea undefined
    const safeBusinesses = businesses.map(b => ({
      ...b,
      profile: b.profile || {},
      prices: b.prices || {},
      themeSettings: b.themeSettings || { primaryColor: 'blue', backgroundColor: 'white' },
    }));

    // Si algún user no tiene businessId, lo dejamos como null
    const safeUsers = users.map(u => ({
      ...u,
      businessId: u.businessId || null,
    }));

    res.json({
      businesses: safeBusinesses,
      users: safeUsers,
      plans,
      subscriptions,
      payments,
    });
  } catch (error) {
    console.error('Error en /admin/dashboard:', error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
