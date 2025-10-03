const express = require('express');
const router = express.Router();
const prisma = require('../prisma'); // <- Usamos la conexión centralizada de Prisma
const { verifyToken } = require('../middleware/authMiddleware');

// GET /api/services -> Obtener todos los servicios DEL NEGOCIO
router.get('/', verifyToken, async (req, res) => {
    const { businessId } = req.user;
    try {
        const services = await prisma.service.findMany({
            where: { businessId },
            orderBy: { name: 'asc' }
        });
        res.json(services);
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
        const newService = await prisma.service.create({
            data: {
                name,
                price: parseFloat(price),
                durationMinutes,
                description,
                businessId,
            }
        });
        res.status(201).json(newService);
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
        const updatedService = await prisma.service.update({
            where: {
                id: parseInt(id),
                businessId: businessId // Asegura que solo se pueda editar un servicio del negocio correcto
            },
            data: {
                name,
                price: parseFloat(price),
                durationMinutes,
                description,
            }
        });
        res.json(updatedService);
    } catch (error) {
        console.error("Error al actualizar servicio:", error);
        if (error.code === 'P2025') { // Error de Prisma para "registro no encontrado"
            return res.status(404).json({ message: "Servicio no encontrado en este negocio." });
        }
        res.status(500).json({ message: "Error interno del servidor" });
    }
});

// DELETE /api/services/:id -> Eliminar un servicio DEL NEGOCIO
router.delete('/:id', verifyToken, async (req, res) => {
    const { id } = req.params;
    const { businessId } = req.user;
    try {
        await prisma.service.delete({
            where: {
                id: parseInt(id),
                businessId: businessId // Condición de seguridad adicional
            }
        });
        res.status(204).send();
    } catch (error) {
        if (error.code === 'P2025') { // Registro no encontrado
            return res.status(404).json({ message: "Servicio no encontrado en este negocio." });
        }
        // Error de restricción de clave externa (ej. el servicio está en una cita)
        if (error.code === 'P2003') { 
            return res.status(409).json({ message: "No se puede eliminar el servicio porque está siendo usado en una o más citas." });
        }
        console.error("Error al eliminar servicio:", error);
        res.status(500).json({ message: "Error interno del servidor" });
    }
});

module.exports = router;