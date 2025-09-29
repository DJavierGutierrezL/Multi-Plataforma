const express = require('express');
const router = express.Router();
const db = require('../db');
const { verifyToken } = require('../middleware/authMiddleware');

// Función auxiliar para formatear clientes a camelCase
const formatClient = (client) => ({
    id: client.id,
    firstName: client.first_name,
    lastName: client.last_name,
    phone: client.phone,
    email: client.email,
    notes: client.notes,
    businessId: client.business_id,
    createdAt: client.created_at,
    birthDate: client.birth_date
});

// GET /api/clients -> Obtener todos los clientes DEL NEGOCIO
router.get('/', verifyToken, async (req, res) => {
    const { businessId } = req.user;
    try {
        const { rows } = await db.query('SELECT * FROM clients WHERE business_id = $1 ORDER BY first_name ASC', [businessId]);
        res.json(rows.map(formatClient));
    } catch (error) {
        console.error("Error al obtener clientes:", error);
        res.status(500).json({ message: "Error interno del servidor" });
    }
});

// POST /api/clients -> Crear un nuevo cliente PARA EL NEGOCIO
router.post('/', verifyToken, async (req, res) => {
    const { businessId } = req.user;
    const { firstName, lastName, phone, email, notes, birthDate } = req.body;

    if (!firstName || !phone) {
        return res.status(400).json({ message: "El nombre y el teléfono son obligatorios." });
    }
    try {
        const query = `
            INSERT INTO clients (first_name, last_name, phone, email, notes, business_id, birth_date)
            VALUES ($1, $2, $3, $4, $5, $6, $7)
            RETURNING *;
        `;
        const { rows } = await db.query(query, [firstName, lastName, phone, email, notes, businessId, birthDate || null]);
        res.status(201).json(formatClient(rows[0]));
    } catch (error) {
        console.error("Error al crear cliente:", error);
        res.status(500).json({ message: "Error interno del servidor" });
    }
});

// PUT /api/clients/:id -> Actualizar un cliente DEL NEGOCIO
router.put('/:id', verifyToken, async (req, res) => {
    const { id } = req.params;
    const { firstName, lastName, phone, email, notes, birthDate } = req.body;
    const { businessId } = req.user;
    try {
        const query = `
            UPDATE clients 
            SET first_name = $1, last_name = $2, phone = $3, email = $4, notes = $5, birth_date = $6
            WHERE id = $7 AND business_id = $8
            RETURNING *;
        `;
        const { rows } = await db.query(query, [firstName, lastName, phone, email, notes, birthDate || null, id, businessId]);
        
        if (rows.length === 0) {
            return res.status(404).json({ message: "Cliente no encontrado en este negocio." });
        }
        res.json(formatClient(rows[0]));
    } catch (error) {
        console.error("Error al actualizar cliente:", error);
        res.status(500).json({ message: "Error interno del servidor" });
    }
});

// DELETE /api/clients/:id -> Eliminar un cliente DEL NEGOCIO
router.delete('/:id', verifyToken, async (req, res) => {
    const { id } = req.params;
    const { businessId } = req.user;
    try {
        const result = await db.query('DELETE FROM clients WHERE id = $1 AND business_id = $2', [id, businessId]);
        if (result.rowCount === 0) {
            return res.status(404).json({ message: "Cliente no encontrado en este negocio." });
        }
        res.status(204).send();
    } catch (error) {
        console.error("Error al eliminar cliente:", error);
        res.status(500).json({ message: "Error interno del servidor" });
    }
});

module.exports = router;