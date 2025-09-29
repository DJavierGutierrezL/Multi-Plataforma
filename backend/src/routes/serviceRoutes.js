const express = require('express');
const router = express.Router();
const db = require('../db');
const { verifyToken } = require('../middleware/authMiddleware');

// GET /api/services -> Obtener todos los servicios DEL NEGOCIO
router.get('/', verifyToken, async (req, res) => {
    const { businessId } = req.user;
    try {
        const { rows } = await db.query('SELECT * FROM services WHERE business_id = $1 ORDER BY name ASC', [businessId]);
        const formattedServices = rows.map(s => ({
            id: s.id,
            name: s.name,
            price: parseFloat(s.price),
            durationMinutes: s.duration_minutes,
            description: s.description,
            businessId: s.business_id
        }));
        res.json(formattedServices);
    } catch (error) {
        console.error("Error al obtener servicios:", error);
        res.status(500).json({ message: "Error interno del servidor" });
    }
});

// POST /api/services -> Crear un nuevo servicio PARA EL NEGOCIO
router.post('/', verifyToken, async (req, res) => {
    const { businessId } = req.user;
    const { name, price, durationMinutes, description } = req.body;

    if (!name || price === undefined) {
        return res.status(400).json({ message: "El nombre y el precio son obligatorios." });
    }
    try {
        const query = `
            INSERT INTO services (name, price, duration_minutes, description, business_id)
            VALUES ($1, $2, $3, $4, $5)
            RETURNING *;
        `;
        const { rows } = await db.query(query, [name, parseFloat(price), durationMinutes, description, businessId]);
        const s = rows[0];
        res.status(201).json({
            id: s.id,
            name: s.name,
            price: parseFloat(s.price),
            durationMinutes: s.duration_minutes,
            description: s.description,
            businessId: s.business_id
        });
    } catch (error) {
        console.error("Error al crear servicio:", error);
        res.status(500).json({ message: "Error interno del servidor" });
    }
});

// PUT /api/services/:id -> Actualizar un servicio DEL NEGOCIO
router.put('/:id', verifyToken, async (req, res) => {
    const { id } = req.params;
    const { businessId } = req.user;
    const { name, price, durationMinutes, description } = req.body;

    if (!name || price === undefined) {
        return res.status(400).json({ message: "Nombre y precio son obligatorios." });
    }

    try {
        const query = `
            UPDATE services 
            SET name = $1, price = $2, duration_minutes = $3, description = $4
            WHERE id = $5 AND business_id = $6 
            RETURNING *;
        `;
        const { rows } = await db.query(query, [name, parseFloat(price), durationMinutes, description, id, businessId]);
        if (rows.length === 0) {
            return res.status(404).json({ message: "Servicio no encontrado en este negocio." });
        }
        const s = rows[0];
        res.json({
            id: s.id,
            name: s.name,
            price: parseFloat(s.price),
            durationMinutes: s.duration_minutes,
            description: s.description,
            businessId: s.business_id
        });
    } catch (error) {
        console.error("Error al actualizar servicio:", error);
        res.status(500).json({ message: "Error interno del servidor" });
    }
});

// DELETE /api/services/:id -> Eliminar un servicio DEL NEGOCIO
router.delete('/:id', verifyToken, async (req, res) => {
    const { id } = req.params;
    const { businessId } = req.user;
    try {
        const result = await db.query('DELETE FROM services WHERE id = $1 AND business_id = $2', [id, businessId]);
        if (result.rowCount === 0) {
            return res.status(404).json({ message: "Servicio no encontrado en este negocio." });
        }
        res.status(204).send();
    } catch (error) {
        if (error.code === '23503') {
            return res.status(409).json({ message: "No se puede eliminar el servicio porque está siendo usado en una o más citas." });
        }
        console.error("Error al eliminar servicio:", error);
        res.status(500).json({ message: "Error interno del servidor" });
    }
});

module.exports = router;