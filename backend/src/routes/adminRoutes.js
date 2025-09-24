// src/routes/adminRoutes.js
const express = require('express');
const router = express.Router();
const db = require('../db');
const { verifyToken } = require('../middleware/authMiddleware');

// GET /api/admin/dashboard -> Obtener todos los datos para el SuperAdmin
router.get('/dashboard', verifyToken, async (req, res) => {
    if (req.user.role !== 'SuperAdmin') {
        return res.status(403).json({ message: 'Acceso denegado.' });
    }

    try {
        const [businessesRes, usersRes, plansRes, subscriptionsRes] = await Promise.all([
            db.query('SELECT * FROM businesses ORDER BY salon_name ASC'),
            db.query('SELECT id, username, first_name, last_name, role, business_id FROM users ORDER BY username ASC'),
            db.query('SELECT * FROM plans ORDER BY name ASC'),
            db.query('SELECT * FROM subscriptions')
        ]);

        const businesses = businessesRes.rows.map(b => ({
            id: b.id,
            type: b.type,
            profile: {
                salonName: b.salon_name
            }
        }));

        const users = usersRes.rows.map(u => ({
            id: u.id,
            username: u.username,
            firstName: u.first_name,
            lastName: u.last_name,
            role: u.role,
            businessId: u.business_id
        }));

        // --- INICIO DE LA CORRECCIÓN ---
        // Formateamos los datos de las suscripciones a camelCase
        const subscriptions = subscriptionsRes.rows.map(s => ({
            id: s.id,
            businessId: s.business_id,
            planId: s.plan_id,
            status: s.status,
            startDate: s.start_date,
            endDate: s.end_date
        }));
        // --- FIN DE LA CORRECCIÓN ---

        res.json({
            businesses: businesses,
            users: users,
            plans: plansRes.rows,
            subscriptions: subscriptions // Enviamos las suscripciones ya formateadas
        });
        
    } catch (error) {
        console.error("Error al obtener los datos del dashboard de admin:", error);
        res.status(500).json({ message: 'Error interno del servidor.' });
    }
});

module.exports = router;