const express = require('express');
const router = express.Router();
const db = require('../db');
const { verifyToken } = require('../middleware/authMiddleware');

// Ruta para crear un nuevo negocio (POST /api/businesses)
router.post('/', verifyToken, async (req, res) => {
    if (req.user.role !== 'SuperAdmin') {
        return res.status(403).json({ message: 'Acceso denegado. Solo los administradores pueden crear negocios.' });
    }
    const { salonName, type } = req.body;
    if (!salonName || !type) {
        return res.status(400).json({ message: 'El nombre y el tipo de negocio son obligatorios.' });
    }
    try {
        const query = `
            INSERT INTO businesses (salon_name, type)
            VALUES ($1, $2)
            RETURNING *;
        `;
        const { rows } = await db.query(query, [salonName, type]);
        const newBusiness = rows[0];

        const formattedBusiness = {
            id: newBusiness.id,
            type: newBusiness.type,
            profile: {
                salonName: newBusiness.salon_name
            }
        };
        res.status(201).json(formattedBusiness);

    } catch (error) {
        console.error("Error al crear el negocio:", error);
        res.status(500).json({ message: 'Error interno del servidor.' });
    }
});

// --- INICIO DE LA MODIFICACIÓN DE DEPURACIÓN ---
// Hemos simplificado esta ruta temporalmente para aislar el error.
router.get('/my-data', verifyToken, (req, res) => {
    console.log('--- RUTA /my-data ALCANZADA ---');
    console.log('El usuario verificado es:', req.user);

    if (!req.user || !req.user.businessId) {
        console.error('ERROR: El usuario no tiene un businessId en el token.');
        return res.status(403).json({ message: "Usuario no asignado a un negocio." });
    }

    // Por ahora, solo devolvemos un objeto simple para probar la conexión.
    // Si esto funciona, el problema está en las consultas a la BBDD que desactivamos.
    const mockBusinessData = {
        business: {
            id: req.user.businessId,
            type: 'NailSalon', // Valor de prueba
            profile: { salonName: "Negocio de Prueba", accountNumber: "123-456" },
            themeSettings: { primaryColor: 'Pink', backgroundColor: 'Blanco' }
        },
        clients: [],
        appointments: [],
        services: [],
        plans: [],
        subscriptions: [],
        payments: []
    };
    
    console.log('Enviando datos de prueba al frontend...');
    res.json(mockBusinessData);
});
// --- FIN DE LA MODIFICACIÓN DE DEPURACIÓN ---

// Ruta para actualizar el perfil
router.put('/profile', verifyToken, async (req, res) => {
    const businessId = req.user.businessId;
    const { salonName, accountNumber } = req.body;

    if (!salonName) {
        return res.status(400).json({ message: "El nombre del salón es obligatorio." });
    }

    try {
        const query = `
            UPDATE businesses 
            SET salon_name = $1, account_number = $2
            WHERE id = $3
            RETURNING salon_name, account_number;
        `;
        const { rows } = await db.query(query, [salonName, accountNumber, businessId]);
        
        const updatedProfile = {
            salonName: rows[0].salon_name,
            accountNumber: rows[0].account_number
        };

        res.json(updatedProfile);

    } catch (error) {
        console.error("Error al actualizar el perfil del negocio:", error);
        res.status(500).json({ message: "Error interno del servidor." });
    }
});

// DELETE /api/businesses/:id -> Eliminar un negocio y sus usuarios asociados
router.delete('/:id', verifyToken, async (req, res) => {
    if (req.user.role !== 'SuperAdmin') {
        return res.status(403).json({ message: 'Acceso denegado.' });
    }

    const { id } = req.params;

    try {
        const result = await db.query('DELETE FROM businesses WHERE id = $1', [id]);
        if (result.rowCount === 0) {
            return res.status(404).json({ message: 'Negocio no encontrado.' });
        }
        res.status(204).send();

    } catch (error) {
        console.error("Error al eliminar el negocio:", error);
        res.status(500).json({ message: 'Error interno del servidor.' });
    }
});

router.put('/theme', verifyToken, async (req, res) => {
    const businessId = req.user.businessId;
    const { primaryColor, backgroundColor } = req.body;

    if (!primaryColor || !backgroundColor) {
        return res.status(400).json({ message: "Se requieren ambos colores." });
    }

    try {
        const query = `
            UPDATE businesses
            SET theme_primary_color = $1, theme_background_color = $2
            WHERE id = $3
            RETURNING theme_primary_color, theme_background_color;
        `;
        const { rows } = await db.query(query, [primaryColor, backgroundColor, businessId]);
        
        const updatedTheme = {
            primaryColor: rows[0].theme_primary_color,
            backgroundColor: rows[0].theme_background_color
        };
        res.json(updatedTheme);

    } catch (error) {
        console.error("Error al actualizar el tema:", error);
        res.status(500).json({ message: "Error interno del servidor." });
    }
});

module.exports = router;

