// src/routes/planRoutes.js
const express = require('express');
const router = express.Router();
const db = require('../db');
const { verifyToken } = require('../middleware/authMiddleware');

// POST /api/plans -> Crea un nuevo plan de suscripción
router.post('/', verifyToken, async (req, res) => {
    // TODO: Proteger esta ruta para que solo el SuperAdmin pueda usarla.
    const { name, price, features } = req.body;

    if (!name || price === undefined || !features) {
        return res.status(400).json({ message: 'Nombre, precio y características son obligatorios.' });
    }

    try {
        // El precio se guarda en la unidad mínima (ej. centavos), pero lo recibimos como unidad principal.
        const query = `
            INSERT INTO plans (name, price, features)
            VALUES ($1, $2, $3)
            RETURNING *;
        `;

        const { rows } = await db.query(query, [name, price, features]);

        res.status(201).json(rows[0]);

    } catch (error) {
        if (error.code === '23505') { // Error de unicidad de PostgreSQL
            return res.status(409).json({ message: 'Ya existe un plan con ese nombre.' });
        }
        console.error("Error al crear el plan:", error);
        res.status(500).json({ message: 'Error interno del servidor.' });
    }
});

module.exports = router;