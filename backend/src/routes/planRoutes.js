const express = require('express');
const router = express.Router();
const prisma = require('../prisma'); // <- Usamos la conexión centralizada de Prisma
const { verifyToken } = require('../middleware/authMiddleware');

// POST /api/plans -> Crea un nuevo plan de suscripción
router.post('/', verifyToken, async (req, res) => {
    // 1. Se añade la verificación de rol para proteger la ruta
    if (req.user.role !== 'SuperAdmin') {
        return res.status(403).json({ message: 'Acceso denegado. Solo los administradores pueden crear planes.' });
    }

    const { name, price, features } = req.body;

    if (!name || price === undefined || !Array.isArray(features)) {
        return res.status(400).json({ message: 'Nombre, precio y un arreglo de características son obligatorios.' });
    }

    try {
        // 2. Se reemplaza la consulta SQL con el método 'create' de Prisma
        const newPlan = await prisma.plan.create({
            data: {
                name: name,
                price: parseFloat(price),
                features: features,
            },
        });

        res.status(201).json(newPlan);

    } catch (error) {
        // 3. Prisma maneja errores de unicidad con el código 'P2002'
        if (error.code === 'P2002' && error.meta?.target?.includes('name')) {
            return res.status(409).json({ message: 'Ya existe un plan con ese nombre.' });
        }
        console.error("Error al crear el plan:", error);
        res.status(500).json({ message: 'Error interno del servidor.' });
    }
});

module.exports = router;