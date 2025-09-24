// backend/src/routes/businessRoutes.js
const express = require('express');
const router = express.Router();
const db = require('../db');
const { verifyToken } = require('../middleware/authMiddleware');

// Ruta específica para '/my-data'. Debe ir ANTES de '/:id'.
router.get('/my-data', verifyToken, async (req, res) => {
    const businessId = req.user.businessId;
    if (!businessId) {
        return res.status(403).json({ message: "Usuario no asignado a un negocio." });
    }
    try {
        const [businessRes, plansRes, subscriptionsRes, paymentsRes, clientsRes, servicesRes, appointmentsRes] = await Promise.all([
            db.query('SELECT * FROM businesses WHERE id = $1', [businessId]),
            db.query('SELECT * FROM plans'),
            db.query('SELECT * FROM subscriptions WHERE business_id = $1', [businessId]),
            db.query('SELECT * FROM payments WHERE business_id = $1', [businessId]),
            db.query('SELECT * FROM clients WHERE business_id = $1 ORDER BY first_name ASC', [businessId]),
            db.query('SELECT * FROM services WHERE business_id = $1 ORDER BY name ASC', [businessId]),
            db.query('SELECT * FROM appointments WHERE business_id = $1 ORDER BY appointment_date DESC', [businessId])
        ]);

        if (businessRes.rows.length === 0) {
            return res.status(404).json({ message: "El negocio asignado no fue encontrado." });
        }

        const business = businessRes.rows[0];
        const formattedBusiness = { id: business.id, type: business.type, profile: { salonName: business.salon_name } };
        const formattedSubscriptions = subscriptionsRes.rows.map(s => ({ id: s.id, businessId: s.business_id, planId: s.plan_id, status: s.status, startDate: s.start_date, endDate: s.end_date }));
        const formattedClients = clientsRes.rows.map(c => ({ id: c.id, firstName: c.first_name, lastName: c.last_name, phone: c.phone, email: c.email, notes: c.notes, businessId: c.business_id, createdAt: c.created_at, birthDate: c.birth_date }));
        const formattedServices = servicesRes.rows.map(s => ({ id: s.id, name: s.name, price: s.price, durationMinutes: s.duration_minutes, description: s.description, businessId: s.business_id }));
        const formattedAppointments = appointmentsRes.rows.map(a => ({ id: a.id, clientId: a.client_id, businessId: a.business_id, appointmentDate: a.appointment_date, appointmentTime: a.appointment_time, cost: a.cost, status: a.status, notes: a.notes }));

        res.json({
            business: formattedBusiness,
            plans: plansRes.rows,
            subscriptions: formattedSubscriptions,
            payments: paymentsRes.rows,
            clients: formattedClients,
            services: formattedServices,
            appointments: formattedAppointments
        });
    } catch (error) {
        console.error("Error crítico al obtener los datos del negocio:", error);
        res.status(500).json({ message: 'Error interno del servidor.' });
    }
});

router.put('/profile', verifyToken, async (req, res) => {
    const businessId = req.user.businessId;
    const { salonName, ownerName, accountNumber } = req.body;

    if (!salonName) {
        return res.status(400).json({ message: "El nombre del salón es obligatorio." });
    }

    try {
        const query = `
            UPDATE businesses 
            SET salon_name = $1, owner_name = $2, account_number = $3
            WHERE id = $4
            RETURNING salon_name, owner_name, account_number;
        `;
        const { rows } = await db.query(query, [salonName, ownerName, accountNumber, businessId]);
        
        const updatedProfile = {
            salonName: rows[0].salon_name,
            ownerName: rows[0].owner_name,
            accountNumber: rows[0].account_number
        };
        res.json(updatedProfile);

    } catch (error) {
        console.error("Error al actualizar el perfil del negocio:", error);
        res.status(500).json({ message: "Error interno del servidor." });
    }
});

module.exports = router;