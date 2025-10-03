const express = require('express');
const router = express.Router();
const prisma = require('../prisma'); // <- Usamos la conexión centralizada de Prisma
const { verifyToken } = require('../middleware/authMiddleware');

// POST /api/subscriptions -> Asigna o actualiza un plan a un negocio (solo SuperAdmin)
router.post('/', verifyToken, async (req, res) => {
    // 1. Se añade la verificación de rol para mayor seguridad
    if (req.user.role !== 'SuperAdmin') {
        return res.status(403).json({ message: 'Acceso denegado.' });
    }
    
    const { businessId, planId } = req.body;

    if (!businessId || !planId) {
        return res.status(400).json({ message: 'businessId y planId son obligatorios.' });
    }

    try {
        const today = new Date();
        const nextMonth = new Date();
        nextMonth.setMonth(today.getMonth() + 1);

        // 2. Usamos 'upsert' de Prisma para simplificar la lógica
        // Esto actualiza la suscripción si ya existe para el businessId, o la crea si no existe.
        const subscription = await prisma.subscription.upsert({
            where: { 
                businessId: parseInt(businessId) 
            },
            update: {
                planId: parseInt(planId),
                startDate: today,
                endDate: nextMonth,
                status: 'Active'
            },
            create: {
                businessId: parseInt(businessId),
                planId: parseInt(planId),
                startDate: today,
                endDate: nextMonth,
                status: 'Active'
            }
        });

        // 3. Prisma devuelve el objeto ya en camelCase, no se necesita formato manual
        res.status(201).json(subscription);

    } catch (error) {
        console.error('Error al asignar o actualizar el plan:', error);
        res.status(500).json({ message: 'Error interno del servidor.' });
    }
});

// PUT /api/subscriptions/:id/status -> Actualiza el estado de una suscripción (solo SuperAdmin)
router.put('/:id/status', verifyToken, async (req, res) => {
    if (req.user.role !== 'SuperAdmin') {
        return res.status(403).json({ message: 'Acceso denegado.' });
    }

    const { id } = req.params;
    const { status } = req.body;

    if (!status) {
        return res.status(400).json({ message: 'El estado es obligatorio.' });
    }

    try {
        // 4. Se usa 'update' de Prisma para modificar el estado
        const updatedSubscription = await prisma.subscription.update({
            where: { id: parseInt(id) },
            data: { status: status }
        });

        res.json(updatedSubscription);

    } catch (error) {
        console.error("Error al actualizar el estado de la suscripción:", error);
        // 5. Se mejora el manejo de errores con códigos de Prisma
        if (error.code === 'P2025') { // Error de Prisma para "registro no encontrado"
            return res.status(404).json({ message: 'Suscripción no encontrada.' });
        }
        res.status(500).json({ message: 'Error interno del servidor.' });
    }
});

module.exports = router;
