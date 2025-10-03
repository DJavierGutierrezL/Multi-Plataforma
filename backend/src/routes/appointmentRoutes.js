const express = require('express');
const router = express.Router();
const prisma = require('../prisma'); // <- Usamos la conexión centralizada de Prisma
const { verifyToken } = require('../middleware/authMiddleware');

// GET /api/appointments -> Obtener todas las citas DEL NEGOCIO
router.get('/', verifyToken, async (req, res) => {
    const { businessId } = req.user;
    try {
        const appointments = await prisma.appointment.findMany({
            where: { businessId },
            include: {
                client: { select: { firstName: true, lastName: true } },
                appointmentServices: { select: { serviceId: true } }
            },
            orderBy: [{ appointmentDate: 'desc' }, { appointmentTime: 'asc' }]
        });
        
        // Formateamos la respuesta para que coincida con la estructura que espera el frontend
        const formattedAppointments = appointments.map(a => ({
            id: a.id,
            clientId: a.clientId,
            clientFirstName: a.client.firstName,
            clientLastName: a.client.lastName,
            appointmentDate: a.appointmentDate.toISOString().split('T')[0],
            appointmentTime: a.appointmentTime,
            cost: a.cost,
            status: a.status,
            notes: a.notes,
            serviceIds: a.appointmentServices.map(s => s.serviceId),
        }));
        res.json(formattedAppointments);
    } catch (error) {
        console.error("Error al obtener citas:", error);
        res.status(500).json({ message: "Error interno del servidor" });
    }
});

// POST /api/appointments -> Crear una nueva cita PARA EL NEGOCIO
router.post('/', verifyToken, async (req, res) => {
    const { businessId } = req.user;
    const { clientId, appointmentDate, appointmentTime, notes, serviceIds } = req.body;

    if (!clientId || !appointmentDate || !serviceIds || !Array.isArray(serviceIds) || serviceIds.length === 0) {
        return res.status(400).json({ message: "Cliente, fecha y al menos un servicio son obligatorios." });
    }

    try {
        // Prisma calcula el costo total de los servicios seleccionados
        const services = await prisma.service.findMany({
            where: { id: { in: serviceIds }, businessId: businessId }
        });

        if (services.length !== serviceIds.length) {
            return res.status(400).json({ message: "Uno o más servicios no son válidos para este negocio." });
        }
        
        const totalCost = services.reduce((sum, service) => sum + parseFloat(service.price), 0);

        // Prisma crea la cita y sus relaciones con los servicios en una sola transacción
        const newAppointment = await prisma.appointment.create({
            data: {
                businessId,
                clientId,
                appointmentDate: new Date(appointmentDate),
                appointmentTime,
                notes,
                cost: totalCost,
                status: 'Scheduled',
                appointmentServices: {
                    create: serviceIds.map(id => ({ serviceId: id }))
                }
            },
            include: { // Incluimos los datos relacionados para la respuesta
                client: { select: { firstName: true, lastName: true } },
                appointmentServices: { select: { serviceId: true } }
            }
        });
        
        // Formateamos la respuesta final
        res.status(201).json({
            id: newAppointment.id,
            clientId: newAppointment.clientId,
            clientFirstName: newAppointment.client.firstName,
            clientLastName: newAppointment.client.lastName,
            appointmentDate: newAppointment.appointmentDate.toISOString().split('T')[0],
            appointmentTime: newAppointment.appointmentTime,
            cost: newAppointment.cost,
            status: newAppointment.status,
            notes: newAppointment.notes,
            serviceIds: newAppointment.appointmentServices.map(s => s.serviceId),
        });

    } catch (error) {
        console.error("Error al crear la cita:", error);
        res.status(500).json({ message: "Error interno del servidor" });
    }
});

// PUT /api/appointments/:id -> Actualizar una cita DEL NEGOCIO
router.put('/:id', verifyToken, async (req, res) => {
    const { id } = req.params;
    const { businessId } = req.user;
    const { clientId, appointmentDate, appointmentTime, status, notes, serviceIds } = req.body;
    
    try {
        const services = await prisma.service.findMany({
            where: { id: { in: serviceIds || [] }, businessId: businessId }
        });
        const finalCost = services.reduce((sum, service) => sum + parseFloat(service.price), 0);

        // Prisma actualiza la cita y sus servicios en una transacción
        const updatedAppointment = await prisma.appointment.update({
            where: { id: parseInt(id), businessId },
            data: {
                clientId,
                appointmentDate: new Date(appointmentDate),
                appointmentTime,
                status,
                notes,
                cost: finalCost,
                appointmentServices: {
                    deleteMany: {}, // Borra todas las relaciones de servicios existentes
                    create: serviceIds ? serviceIds.map(sid => ({ serviceId: sid })) : [] // Y crea las nuevas
                }
            },
            include: {
                client: { select: { firstName: true, lastName: true } },
                appointmentServices: { select: { serviceId: true } }
            }
        });
        
        res.json({
            id: updatedAppointment.id,
            clientId: updatedAppointment.clientId,
            clientFirstName: updatedAppointment.client.firstName,
            clientLastName: updatedAppointment.client.lastName,
            appointmentDate: updatedAppointment.appointmentDate.toISOString().split('T')[0],
            appointmentTime: updatedAppointment.appointmentTime,
            cost: updatedAppointment.cost,
            status: updatedAppointment.status,
            notes: updatedAppointment.notes,
            serviceIds: updatedAppointment.appointmentServices.map(s => s.serviceId),
        });

    } catch (error) {
        console.error("Error al actualizar la cita:", error);
        res.status(500).json({ message: "Error interno del servidor" });
    }
});

// DELETE /api/appointments/:id -> Eliminar una cita DEL NEGOCIO
router.delete('/:id', verifyToken, async (req, res) => {
    const { id } = req.params;
    const { businessId } = req.user;
    try {
        // Prisma se asegura de que la cita pertenezca al negocio antes de borrarla
        await prisma.appointment.delete({
            where: { id: parseInt(id), businessId }
        });
        res.status(204).send();
    } catch (error) {
        // Prisma maneja errores como 'registro no encontrado' automáticamente
        console.error("Error al eliminar la cita:", error);
        res.status(500).json({ message: "Error interno del servidor" });
    }
});

module.exports = router;