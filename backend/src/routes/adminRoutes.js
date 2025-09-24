// src/routes/adminRoutes.js
const express = require('express');
const router = express.Router();
const db = require('../db');
const { verifyToken } = require('../middleware/authMiddleware');

// GET /api/admin/dashboard -> Obtiene todos los datos para el panel de SuperAdmin
router.get('/dashboard', verifyToken, async (req, res) => {
    try {
        const [businessesRes, usersRes, plansRes, subscriptionsRes, paymentsRes] = await Promise.all([
            db.query('SELECT * FROM businesses ORDER BY id ASC'),
            db.query('SELECT * FROM users'),
            db.query('SELECT * FROM plans'),
            db.query('SELECT * FROM subscriptions'),
            db.query('SELECT * FROM payments')
        ]);

        // Formateas los negocios (esto ya lo tenías bien)
        const formattedBusinesses = businessesRes.rows.map(business => ({
            id: business.id,
            subscriptionId: null,
            type: business.type,
            profile: {
                salonName: business.salon_name,
                ownerName: business.owner_name || '',
                accountNumber: business.account_number || ''
            },
            prices: business.prices || {},
            themeSettings: {
                primaryColor: business.theme_primary_color,
                backgroundColor: business.theme_background_color
            },
            clients: [],
            appointments: [],
            products: []
        }));

        // --- INICIO DE LA CORRECCIÓN ---
        // ¡Aplica la misma corrección a las suscripciones!
        const formattedSubscriptions = subscriptionsRes.rows.map(sub => ({
            id: sub.id,
            businessId: sub.business_id,
            planId: sub.plan_id,
            status: sub.status,
            startDate: sub.start_date,
            endDate: sub.end_date
        }));
        // --- FIN DE LA CORRECCIÓN ---

        res.json({
            businesses: formattedBusinesses,
            users: usersRes.rows.map(user => ({ // También es buena idea formatear los usuarios
                id: user.id,
                firstName: user.first_name,
                lastName: user.last_name,
                username: user.username,
                role: user.role,
                businessId: user.business_id,
                phone: user.phone
            })),
            plans: plansRes.rows,
            subscriptions: formattedSubscriptions, // <-- Usa el nuevo array formateado
            payments: paymentsRes.rows // (Si es necesario, formatea los pagos también)
        });

    } catch (error) {
        console.error("Error al obtener los datos del dashboard de admin:", error);
        res.status(500).json({ message: 'Error interno del servidor.' });
    }
});

module.exports = router;