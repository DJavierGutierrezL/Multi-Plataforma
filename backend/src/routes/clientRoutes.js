const express = require('express');
const router = express.Router();
const prisma = require('../prisma'); // <- Usamos la conexión centralizada de Prisma
const { verifyToken } = require('../middleware/authMiddleware');

// GET /api/clients -> Obtener todos los clientes DEL NEGOCIO
router.get('/', verifyToken, async (req, res) => {
    const { businessId } = req.user;
    try {
        const clients = await prisma.client.findMany({
            where: { businessId },
            orderBy: { firstName: 'asc' }
        });
        res.json(clients);
    } catch (error) {
        console.error("Error al obtener clientes:", error);
        res.status(500).json({ message: "Error interno del servidor" });
    }
});

// POST /api/clients -> Crear un nuevo cliente PARA EL NEGOCIO
router.post('/', verifyToken, async (req, res) => {
    const { businessId } = req.user;
    const { firstName, lastName, phone, email, notes, birthDate } = req.body;

    if (!firstName || !phone) {
        return res.status(400).json({ message: "El nombre y el teléfono son obligatorios." });
    }
    try {
        const newClient = await prisma.client.create({
            data: {
                firstName,
                lastName,
                phone,
                email,
                notes,
                businessId,
                birthDate: birthDate ? new Date(birthDate) : null,
            }
        });
        res.status(201).json(newClient);
    } catch (error) {
        console.error("Error al crear cliente:", error);
        res.status(500).json({ message: "Error interno del servidor" });
    }
});

// PUT /api/clients/:id -> Actualizar un cliente DEL NEGOCIO
router.put('/:id', verifyToken, async (req, res) => {
    const { id } = req.params;
    const { firstName, lastName, phone, email, notes, birthDate } = req.body;
    const { businessId } = req.user;
    try {
        const updatedClient = await prisma.client.update({
            where: {
                id: parseInt(id),
                businessId: businessId // Asegura que solo se pueda editar un cliente del negocio correcto
            },
            data: {
                firstName,
                lastName,
                phone,
                email,
                notes,
                birthDate: birthDate ? new Date(birthDate) : null,
            }
        });
        res.json(updatedClient);
    } catch (error) {
        console.error("Error al actualizar cliente:", error);
        // Prisma arroja un error si el registro no se encuentra, que podemos capturar.
        if (error.code === 'P2025') {
            return res.status(404).json({ message: "Cliente no encontrado en este negocio." });
        }
        res.status(500).json({ message: "Error interno del servidor" });
    }
});

// DELETE /api/clients/:id -> Eliminar un cliente DEL NEGOCIO
router.delete('/:id', verifyToken, async (req, res) => {
    const { id } = req.params;
    const { businessId } = req.user;
    try {
        await prisma.client.delete({
            where: {
                id: parseInt(id),
                businessId: businessId // Condición de seguridad adicional
            }
        });
        res.status(204).send();
    } catch (error) {
        console.error("Error al eliminar cliente:", error);
        if (error.code === 'P2025') {
            return res.status(404).json({ message: "Cliente no encontrado en este negocio." });
        }
        res.status(500).json({ message: "Error interno del servidor" });
    }
});

module.exports = router;