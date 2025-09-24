const express = require('express');
const router = express.Router();
const db = require('../db');
const { verifyToken } = require('../middleware/authMiddleware');

// GET /api/appointments -> Obtener todas las citas del negocio
router.get('/', verifyToken, async (req, res) => {
    const businessId = req.user.businessId;
    try {
        const query = `
            SELECT 
                a.id, a.client_id, a.business_id,
                c.first_name, c.last_name,
                a.appointment_date, a.appointment_time,
                a.cost, a.status, a.notes,
                COALESCE(array_agg(s.id) FILTER (WHERE s.id IS NOT NULL), '{}') AS service_ids
            FROM appointments a
            JOIN clients c ON a.client_id = c.id
            LEFT JOIN appointment_services aps ON a.id = aps.appointment_id
            LEFT JOIN services s ON aps.service_id = s.id
            WHERE a.business_id = $1
            GROUP BY a.id, c.id 
            ORDER BY a.appointment_date DESC, a.appointment_time ASC;
        `;
        const { rows } = await db.query(query, [businessId]);
        const formattedAppointments = rows.map(a => ({
            id: a.id,
            clientId: a.client_id,
            clientFirstName: a.first_name,
            clientLastName: a.last_name,
            appointmentDate: a.appointment_date.toISOString().split('T')[0],
            appointmentTime: a.appointment_time,
            cost: parseFloat(a.cost),
            status: a.status,
            notes: a.notes,
            serviceIds: a.service_ids,
        }));
        res.json(formattedAppointments);
    } catch (error) {
        console.error("Error al obtener citas:", error);
        res.status(500).json({ message: "Error interno del servidor" });
    }
});

// POST /api/appointments -> Crear una nueva cita
router.post('/', verifyToken, async (req, res) => {
    const businessId = req.user.businessId;
    const { clientId, appointmentDate, appointmentTime, notes, serviceIds } = req.body;

    if (!clientId || !appointmentDate || !serviceIds || !Array.isArray(serviceIds) || serviceIds.length === 0) {
        return res.status(400).json({ message: "Cliente, fecha y al menos un servicio son obligatorios." });
    }

    const client = await db.query('BEGIN');
    try {
        const servicesQuery = 'SELECT SUM(price) as total FROM services WHERE id = ANY($1::int[]) AND business_id = $2';
        const servicesRes = await db.query(servicesQuery, [serviceIds, businessId]);
        const totalCost = servicesRes.rows[0].total || 0;

        const appointmentQuery = `
            INSERT INTO appointments (client_id, business_id, appointment_date, appointment_time, cost, notes, status)
            VALUES ($1, $2, $3, $4, $5, $6, 'Scheduled')
            RETURNING id;
        `;
        const appointmentRes = await db.query(appointmentQuery, [clientId, businessId, appointmentDate, appointmentTime, totalCost, notes]);
        const newAppointmentId = appointmentRes.rows[0].id;

        if (serviceIds.length > 0) {
            const servicesInsertQuery = 'INSERT INTO appointment_services (appointment_id, service_id) SELECT $1, unnest($2::int[]);';
            await db.query(servicesInsertQuery, [newAppointmentId, serviceIds]);
        }

        await db.query('COMMIT');

        const finalQuery = `
            SELECT 
                a.id, a.client_id, c.first_name, c.last_name,
                a.appointment_date, a.appointment_time,
                a.cost, a.status, a.notes,
                COALESCE(array_agg(s.id) FILTER (WHERE s.id IS NOT NULL), '{}') AS service_ids
            FROM appointments a
            JOIN clients c ON a.client_id = c.id
            LEFT JOIN appointment_services aps ON a.id = aps.appointment_id
            LEFT JOIN services s ON aps.service_id = s.id
            WHERE a.id = $1
            GROUP BY a.id, c.id;
        `;
        const finalRes = await db.query(finalQuery, [newAppointmentId]);
        const newAppointment = finalRes.rows[0];

        res.status(201).json({
            id: newAppointment.id,
            clientId: newAppointment.client_id,
            clientFirstName: newAppointment.first_name,
            clientLastName: newAppointment.last_name,
            appointmentDate: newAppointment.appointment_date.toISOString().split('T')[0],
            appointmentTime: newAppointment.appointment_time,
            cost: parseFloat(newAppointment.cost),
            status: newAppointment.status,
            notes: newAppointment.notes,
            serviceIds: newAppointment.service_ids,
        });

    } catch (error) {
        await db.query('ROLLBACK');
        console.error("Error al crear la cita:", error);
        res.status(500).json({ message: "Error interno del servidor" });
    }
});

// PUT /api/appointments/:id -> Actualizar una cita
router.put('/:id', verifyToken, async (req, res) => {
    const { id } = req.params;
    const businessId = req.user.businessId;
    const { clientId, appointmentDate, appointmentTime, status, notes, serviceIds } = req.body;
    
    const client = await db.query('BEGIN');
    try {
        const servicesQuery = 'SELECT SUM(price) as total FROM services WHERE id = ANY($1::int[]) AND business_id = $2';
        const servicesRes = await db.query(servicesQuery, [serviceIds, businessId]);
        const finalCost = servicesRes.rows[0].total || 0;

        const updateAppointmentQuery = `
            UPDATE appointments 
            SET client_id = $1, appointment_date = $2, appointment_time = $3, cost = $4, status = $5, notes = $6
            WHERE id = $7 AND business_id = $8;
        `;
        await db.query(updateAppointmentQuery, [clientId, appointmentDate, appointmentTime, finalCost, status, notes, id, businessId]);

        if (serviceIds) {
            await db.query('DELETE FROM appointment_services WHERE appointment_id = $1', [id]);
            if (serviceIds.length > 0) {
                const servicesInsertQuery = 'INSERT INTO appointment_services (appointment_id, service_id) SELECT $1, unnest($2::int[]);';
                await db.query(servicesInsertQuery, [id, serviceIds]);
            }
        }
        
        await db.query('COMMIT');
        
        const finalQuery = `
            SELECT 
                a.id, a.client_id, c.first_name, c.last_name,
                a.appointment_date, a.appointment_time,
                a.cost, a.status, a.notes,
                COALESCE(array_agg(s.id) FILTER (WHERE s.id IS NOT NULL), '{}') AS service_ids
            FROM appointments a
            JOIN clients c ON a.client_id = c.id
            LEFT JOIN appointment_services aps ON a.id = aps.appointment_id
            LEFT JOIN services s ON aps.service_id = s.id
            WHERE a.id = $1
            GROUP BY a.id, c.id;
        `;
        const finalRes = await db.query(finalQuery, [id]);
        const updatedApp = finalRes.rows[0];
        
        res.json({
            id: updatedApp.id,
            clientId: updatedApp.client_id,
            clientFirstName: updatedApp.first_name,
            clientLastName: updatedApp.last_name,
            appointmentDate: updatedApp.appointment_date.toISOString().split('T')[0],
            appointmentTime: updatedApp.appointment_time,
            cost: parseFloat(updatedApp.cost),
            status: updatedApp.status,
            notes: updatedApp.notes,
            serviceIds: updatedApp.service_ids,
        });

    } catch (error) {
        await db.query('ROLLBACK');
        console.error("Error al actualizar la cita:", error);
        res.status(500).json({ message: "Error interno del servidor" });
    }
});

// DELETE /api/appointments/:id -> Eliminar una cita
router.delete('/:id', verifyToken, async (req, res) => {
    const { id } = req.params;
    const businessId = req.user.businessId;
    try {
        const result = await db.query(
            'DELETE FROM appointments WHERE id = $1 AND business_id = $2',
            [id, businessId]
        );
        if (result.rowCount === 0) {
            return res.status(404).json({ message: "Cita no encontrada o no pertenece a este negocio." });
        }
        res.status(204).send();
    } catch (error) {
        console.error("Error al eliminar la cita:", error);
        res.status(500).json({ message: "Error interno del servidor" });
    }
});

module.exports = router;