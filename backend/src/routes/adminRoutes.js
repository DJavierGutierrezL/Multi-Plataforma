const express = require('express');
const router = express.Router();
const prisma = require('../prisma'); // <- Usamos la conexión centralizada de Prisma
const { verifyToken } = require('../middleware/authMiddleware');

// GET /api/admin/dashboard -> Obtener todos los datos para el SuperAdmin
router.get('/dashboard', verifyToken, async (req, res) => {
    // 1. Verifica que el usuario sea SuperAdmin
    if (req.user.role !== 'SuperAdmin') {
        return res.status(403).json({ message: 'Acceso denegado.' });
    }

    try {
        // 2. Realiza todas las consultas a la base de datos usando Prisma
        const [businesses, users, plans, subscriptions] = await Promise.all([
            prisma.business.findMany({ orderBy: { salonName: 'asc' } }),
            prisma.user.findMany({
                select: { // Seleccionamos solo los campos necesarios
                    id: true,
                    username: true,
                    firstName: true,
                    lastName: true,
                    role: true,
                    businessId: true
                },
                orderBy: { username: 'asc' }
            }),
            prisma.plan.findMany({ orderBy: { name: 'asc' } }),
            prisma.subscription.findMany()
        ]);

        // 3. Formatea los datos de los negocios para que coincidan con lo que el frontend espera
        const formattedBusinesses = businesses.map(b => ({
            id: b.id,
            type: b.type,
            profile: {
                salonName: b.salonName
            },
            themeSettings: {
                primaryColor: b.themePrimaryColor === 'Pink' ? 'Rosa' : b.themePrimaryColor,
                backgroundColor: b.themeBackgroundColor
            }
        }));

        // 4. Envía la respuesta JSON con todos los datos
        res.json({
            businesses: formattedBusinesses,
            users: users,
            plans: plans,
            subscriptions: subscriptions
        });
        
    } catch (error) {
        console.error("Error al obtener los datos del dashboard de admin:", error);
        res.status(500).json({ message: 'Error interno del servidor.' });
    }
});

module.exports = router;