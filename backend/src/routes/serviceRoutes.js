// backend/src/routes/serviceRoutes.js
const express = require('express');
const router = express.Router();
const db = require('../db');
const { verifyToken } = require('../middleware/authMiddleware');

// GET /api/services -> Obtener todos los servicios del negocio del usuario
router.get('/', verifyToken, async (req, res) => {
    const businessId = req.user.businessId;
    if (!businessId) {
        return res.status(403).json({ message: "Usuario no asignado a un negocio." });
    }
    try {
        const { rows } = await db.query('SELECT * FROM services WHERE business_id = $1 ORDER BY name ASC', [businessId]);
        res.json(rows); // <-- Ahora consulta la base de datos real
    } catch (error) {
        console.error("Error al obtener servicios:", error);
        res.status(500).json({ message: "Error interno del servidor" });
    }
});

// POST /api/services -> Crear un nuevo servicio
router.post('/', verifyToken, async (req, res) => {
    const businessId = req.user.businessId;
    const { name, price, duration_minutes, description } = req.body;

    if (!name || price === undefined) {
        return res.status(400).json({ message: "El nombre y el precio son obligatorios." });
    }
    try {
        const query = `
            INSERT INTO services (name, price, duration_minutes, description, business_id)
            VALUES ($1, $2, $3, $4, $5)
            RETURNING *;
        `;
        const { rows } = await db.query(query, [name, price, duration_minutes, description, businessId]);
        res.status(201).json(rows[0]);
    } catch (error) {
        console.error("Error al crear servicio:", error);
        res.status(500).json({ message: "Error interno del servidor" });
    }
});

// PUT /api/services/:id -> Actualizar un servicio
router.put('/:id', verifyToken, async (req, res) => {
    const { id } = req.params;
    const businessId = req.user.businessId;
    const { name, price } = req.body;

    if (!name || price === undefined) {
        return res.status(400).json({ message: "Nombre y precio son obligatorios." });
    }

    try {
        const query = `
            UPDATE services SET name = $1, price = $2 
            WHERE id = $3 AND business_id = $4 RETURNING *;
        `;
        const { rows } = await db.query(query, [name, price, id, businessId]);
        if (rows.length === 0) {
            return res.status(404).json({ message: "Servicio no encontrado." });
        }
        res.json(rows[0]);
    } catch (error) {
        // ... (manejo de errores)
    }
});

// DELETE /api/services/:id -> Eliminar un servicio
router.delete('/:id', verifyToken, async (req, res) => {
    const { id } = req.params;
    const businessId = req.user.businessId;
    try {
        const result = await db.query('DELETE FROM services WHERE id = $1 AND business_id = $2', [id, businessId]);
        if (result.rowCount === 0) {
            return res.status(404).json({ message: "Servicio no encontrado." });
        }
        res.status(204).send();
    } catch (error) {
        // ... (manejo de errores)
    }
});

module.exports = router;