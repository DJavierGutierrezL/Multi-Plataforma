// src/routes/authRoutes.js
const express = require('express');
const router = express.Router();
const db = require('../db');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// POST /api/auth/login -> Inicia sesión de un usuario
router.post('/login', async (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
        return res.status(400).json({ message: 'Usuario y contraseña son obligatorios.' });
    }

    try {
        const { rows } = await db.query('SELECT * FROM users WHERE username = $1', [username]);
        if (rows.length === 0) {
            return res.status(401).json({ message: 'Credenciales inválidas.' });
        }

        const user = rows[0];

        // --- INICIO DE LA DEPURACIÓN ---
console.log("DATOS CRUDOS DEL USUARIO DESDE LA DB:", user);
// --- FIN DE LA DEPURACIÓN ---

        const isPasswordValid = await bcrypt.compare(password, user.password_hash);
        if (!isPasswordValid) {
            return res.status(401).json({ message: 'Credenciales inválidas.' });
        }

        // --- INICIO DE LA MODIFICACIÓN ---

        // 1. Creamos un payload para el token que incluye el businessId del usuario.
        // Esto es crucial para la seguridad en las futuras peticiones.
        const payload = {
            id: user.id,
            username: user.username,
            role: user.role,
            businessId: user.business_id 
        };

        // --- INICIO DE LA DEPURACIÓN ---
        console.log("PAYLOAD QUE SE INCLUIRÁ EN EL TOKEN:", payload);
        // --- FIN DE LA DEPURACIÓN ---

        const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '8h' });

        // 2. Si el usuario es normal (no SuperAdmin) y tiene un negocio asignado,
        // buscamos los datos de ese negocio para devolverlos inmediatamente.
        let businessData = null;
        if (user.role !== 'SuperAdmin' && user.business_id) {
            const businessRes = await db.query('SELECT * FROM businesses WHERE id = $1', [user.business_id]);
            if (businessRes.rows.length > 0) {
                const business = businessRes.rows[0];
                // Formateamos el objeto del negocio a camelCase para el frontend
                businessData = {
                    id: business.id,
                    type: business.type,
                    profile: { 
                        salonName: business.salon_name 
                    },
                    themeSettings: {
                         primaryColor: business.theme_primary_color,
                         backgroundColor: business.theme_background_color
                    }
                    // Añade aquí otros campos del negocio que quieras cargar al inicio
                };
            }
        }

        // 3. Preparamos el objeto de usuario para enviar al frontend, también en camelCase.
        const formattedUser = {
            id: user.id,
            username: user.username,
            role: user.role,
            businessId: user.business_id,
            firstName: user.first_name,
            lastName: user.last_name
        };

        // 4. Enviamos una respuesta completa con el usuario, el token y los datos del negocio.
        res.json({
            user: formattedUser,
            token,
            business: businessData
        });

        // --- FIN DE LA MODIFICACIÓN ---

    } catch (error) {
        console.error("Error en el inicio de sesión:", error);
        res.status(500).json({ message: 'Error interno del servidor.' });
    }
});

// GET /api/auth/me -> Verifica el token y devuelve los datos del usuario
router.get('/me', require('../middleware/authMiddleware').verifyToken, (req, res) => {
    // El middleware 'verifyToken' ya ha decodificado el token y ha puesto los datos en req.user
    // Simplemente devolvemos esa información.
    res.json({ user: req.user });
});


// Aquí puedes tener tu ruta de registro (POST /register)
// ...

module.exports = router;