// src/routes/userRoutes.js
const express = require('express');
const router = express.Router();
const db = require('../db');
const bcrypt = require('bcrypt');
const { verifyToken } = require('../middleware/authMiddleware');

// POST /api/users -> Crea un nuevo usuario
router.post('/', verifyToken, async (req, res) => {
    // TODO: Proteger esta ruta para que solo el SuperAdmin pueda crear usuarios.
    const { firstName, lastName, phone, username, password, businessId } = req.body;

    if (!username || !password || !firstName || !lastName) {
        return res.status(400).json({ message: 'Nombre, apellido, usuario y contraseña son obligatorios.' });
    }

    try {
        // Hasheamos la contraseña antes de guardarla
        const saltRounds = 10;
        const passwordHash = await bcrypt.hash(password, saltRounds);

        const query = `
            INSERT INTO users (first_name, last_name, phone, username, password_hash, business_id, role)
            VALUES ($1, $2, $3, $4, $5, $6, 'User')
            RETURNING id, first_name, last_name, phone, username, business_id, role;
        `;

        const { rows } = await db.query(query, [firstName, lastName, phone, username, passwordHash, businessId || null]);

        res.status(201).json(rows[0]);

    } catch (error) {
        // Manejar error de usuario duplicado
        if (error.code === '23505') { // Código de error de PostgreSQL para violación de unicidad
            return res.status(409).json({ message: 'El nombre de usuario ya existe.' });
        }
        console.error("Error al crear el usuario:", error);
        res.status(500).json({ message: 'Error interno del servidor.' });
    }
});

module.exports = router;