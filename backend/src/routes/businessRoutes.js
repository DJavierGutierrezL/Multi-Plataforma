const express = require('express');
const router = express.Router();
const db = require('../db');
const { verifyToken } = require('../middleware/authMiddleware');

router.post('/', verifyToken, async (req, res) => {
    if (req.user.role !== 'SuperAdmin') {
        return res.status(403).json({ message: 'Acceso denegado.' });
    }
    const { salonName, type } = req.body;
    if (!salonName || !type) {
        return res.status(400).json({ message: 'Nombre y tipo son obligatorios.' });
    }
    try {
        const query = `INSERT INTO businesses (salon_name, type) VALUES ($1, $2) RETURNING *;`;
        const { rows } = await db.query(query, [salonName, type]);
        const newBusiness = rows[0];
        const formattedBusiness = {
            id: newBusiness.id,
            type: newBusiness.type,
            profile: { salonName: newBusiness.salon_name },
            themeSettings: {
                primaryColor: 'Rosa',
                backgroundColor: 'Blanco'
            }
        };
        res.status(201).json(formattedBusiness);
    } catch (error) {
        console.error("Error al crear el negocio:", error);
        res.status(500).json({ message: 'Error interno del servidor.' });
    }
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
            themeSettings: {
                primaryColor: business.theme_primary_color === 'Pink' ? 'Rosa' : business.theme_primary_color || 'Rosa',
                backgroundColor: business.theme_background_color || 'Blanco'
            }
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
        console.error("----------- ERROR CRÍTICO EN /my-data -----------");
        console.error("Business ID:", businessId);
        console.error("Detalles del Error:", error);
        res.status(500).json({ message: 'Error interno del servidor al cargar datos del negocio.' });
    }
});

router.put('/profile', verifyToken, async (req, res) => {
    const businessId = req.user.businessId;
    const { salonName, accountNumber } = req.body;
    try {
        const query = `UPDATE businesses SET salon_name = $1, account_number = $2 WHERE id = $3 RETURNING salon_name, account_number`;
        const { rows } = await db.query(query, [salonName, accountNumber, businessId]);
        if (rows.length === 0) return res.status(404).json({ message: 'Negocio no encontrado.' });
        res.json({ salonName: rows[0].salon_name, accountNumber: rows[0].account_number });
    } catch (error) {
        console.error("Error al actualizar perfil:", error);
        res.status(500).json({ message: 'Error interno.' });
    }
});

router.delete('/:id', verifyToken, async (req, res) => {
    if (req.user.role !== 'SuperAdmin') return res.status(403).json({ message: 'Acceso denegado.' });
    const { id } = req.params;
    try {
        const result = await db.query('DELETE FROM businesses WHERE id = $1', [id]);
        if (result.rowCount === 0) return res.status(404).json({ message: 'Negocio no encontrado.' });
        res.status(204).send();
    } catch (error) {
        console.error("Error al eliminar el negocio:", error);
        res.status(500).json({ message: 'Error interno del servidor.' });
    }
});

router.put('/theme', verifyToken, async (req, res) => {
    const businessId = req.user.role === 'SuperAdmin' ? req.body.businessIdForAdmin : req.user.businessId;
    const { primaryColor, backgroundColor } = req.body;

    const primaryColorForDb = primaryColor === 'Rosa' ? 'Pink' : primaryColor;

    if (!primaryColor || !backgroundColor) {
        return res.status(400).json({ message: "Se requieren ambos colores." });
    }
    if (!businessId) {
        return res.status(403).json({ message: "ID de negocio no proporcionado." });
    }

    try {
        const query = `
            UPDATE businesses
            SET theme_primary_color = $1, theme_background_color = $2
            WHERE id = $3
            RETURNING theme_primary_color, theme_background_color;
        `;
        const { rows } = await db.query(query, [primaryColorForDb, backgroundColor, businessId]);
        
        if (rows.length === 0) {
            return res.status(404).json({ message: "Negocio no encontrado." });
        }

        const updatedTheme = {
            primaryColor: rows[0].theme_primary_color === 'Pink' ? 'Rosa' : rows[0].theme_primary_color,
            backgroundColor: rows[0].theme_background_color
        };
        res.json(updatedTheme);

    } catch (error) {
        console.error("Error al actualizar el tema:", error);
        res.status(500).json({ message: 'Error interno del servidor.' });
    }
});

module.exports = router;