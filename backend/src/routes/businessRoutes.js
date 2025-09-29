const express = require('express');
const router = express.Router();
const db = require('../db');
const { verifyToken } = require('../middleware/authMiddleware');

router.post('/', verifyToken, async (req, res) => {
    // ... tu código para crear negocios sin cambios ...
});

router.get('/my-data', verifyToken, async (req, res) => {
    const businessId = req.user.businessId;
    if (!businessId) {
        return res.status(403).json({ message: "Usuario no asignado a un negocio." });
    }
    try {
        const appointmentsQuery = `
            SELECT a.*, c.first_name, c.last_name,
                   COALESCE(array_agg(aps.service_id) FILTER (WHERE aps.service_id IS NOT NULL), '{}') AS service_ids
            FROM appointments a
            JOIN clients c ON a.client_id = c.id
            LEFT JOIN appointment_services aps ON a.id = aps.appointment_id
            WHERE a.business_id = $1
            GROUP BY a.id, c.id 
            ORDER BY a.appointment_date DESC, a.appointment_time ASC;
        `;
        
        const [businessRes, plansRes, subscriptionsRes, clientsRes, servicesRes, appointmentsRes] = await Promise.all([
            db.query('SELECT * FROM businesses WHERE id = $1', [businessId]),
            db.query('SELECT * FROM plans'),
            db.query('SELECT * FROM subscriptions WHERE business_id = $1', [businessId]),
            db.query('SELECT * FROM clients WHERE business_id = $1 ORDER BY first_name ASC', [businessId]),
            db.query('SELECT * FROM services WHERE business_id = $1 ORDER BY name ASC', [businessId]),
            db.query(appointmentsQuery, [businessId])
        ]);

        if (businessRes.rows.length === 0) {
            return res.status(404).json({ message: "El negocio asignado no fue encontrado." });
        }

        const business = businessRes.rows[0];
        
        const formattedBusiness = {
            id: business.id, type: business.type,
            profile: { salonName: business.salon_name, accountNumber: business.account_number },
            themeSettings: { primaryColor: business.theme_primary_color || 'Pink', backgroundColor: business.theme_background_color || 'Blanco' }
        };

        const formattedSubscriptions = subscriptionsRes.rows.map(s => ({ id: s.id, businessId: s.business_id, planId: s.plan_id, status: s.status, startDate: s.start_date, endDate: s.end_date }));
        const formattedClients = clientsRes.rows.map(c => ({ id: c.id, firstName: c.first_name, lastName: c.last_name, phone: c.phone, email: c.email, notes: c.notes, businessId: c.business_id, createdAt: c.created_at, birthDate: c.birth_date }));
        const formattedServices = servicesRes.rows.map(s => ({ id: s.id, name: s.name, price: parseFloat(s.price), durationMinutes: s.duration_minutes, description: s.description, businessId: s.business_id }));
        
        const formattedAppointments = appointmentsRes.rows.map(a => ({
            id: a.id, clientId: a.client_id, businessId: a.business_id,
            clientFirstName: a.first_name, clientLastName: a.last_name,
            appointmentDate: a.appointment_date ? new Date(a.appointment_date).toISOString().split('T')[0] : null,
            appointmentTime: a.appointment_time, cost: a.cost ? parseFloat(a.cost) : 0,
            status: a.status, notes: a.notes, serviceIds: a.service_ids,
        }));

        res.json({
            business: formattedBusiness, plans: plansRes.rows, subscriptions: formattedSubscriptions,
            payments: [], clients: formattedClients, services: formattedServices, appointments: formattedAppointments
        });
    } catch (error) {
        console.error("----------- ERROR CRÍTICO EN /my-data (VERSIÓN FINAL) -----------");
        console.error("Business ID:", businessId);
        console.error("Detalles del Error:", error);
        res.status(500).json({ message: 'Error interno del servidor al cargar datos del negocio.' });
    }
});

router.put('/profile', verifyToken, async (req, res) => {
    // ... tu código para actualizar perfil sin cambios ...
});

router.delete('/:id', verifyToken, async (req, res) => {
    // ... tu código para eliminar negocios sin cambios ...
});

router.put('/theme', verifyToken, async (req, res) => {
    // ... tu código para actualizar tema sin cambios ...
});

module.exports = router;