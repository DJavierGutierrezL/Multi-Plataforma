const express = require('express');
const router = express.Router();
const prisma = require('../prisma');
const { verifyToken } = require('../middleware/authMiddleware');

// GET /api/appointments -> Obtener todas las citas del negocio
router.get('/', verifyToken, async (req, res) => {
    const { businessId } = req.user;
    try {
        const appointments = await prisma.appointment.findMany({
            where: { businessId },
            include: {
                client: { select: { firstName: true, lastName: true } },
                appointmentServices: { select: { serviceId: true } }
            },
            orderBy: { dateTime: 'desc' } // Ordenamos por el nuevo campo unificado
        });
        
        // Formateamos la respuesta para devolver fecha y hora por separado, como espera el frontend
        const formattedAppointments = appointments.map(a => ({
            id: a.id,
            clientId: a.clientId,
            clientFirstName: a.client.firstName,
            clientLastName: a.client.lastName,
            appointmentDate: a.dateTime.toISOString().split('T')[0], // Extraemos la fecha
            appointmentTime: a.dateTime.toTimeString().split(' ')[0].substring(0, 5), // Extraemos la hora
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

// POST /api/appointments -> Crear una nueva cita para el negocio
router.post('/', verifyToken, async (req, res) => {
    const { businessId } = req.user;
    const { clientId, appointmentDate, appointmentTime, notes, serviceIds } = req.body;

    if (!clientId || !appointmentDate || !appointmentTime || !serviceIds || !Array.isArray(serviceIds) || serviceIds.length === 0) {
        return res.status(400).json({ message: "Cliente, fecha, hora y al menos un servicio son obligatorios." });
    }

    try {
        const services = await prisma.service.findMany({
            where: { id: { in: serviceIds }, businessId: businessId }
        });
        if (services.length !== serviceIds.length) {
            return res.status(400).json({ message: "Uno o más servicios no son válidos para este negocio." });
        }
        const totalCost = services.reduce((sum, service) => sum + parseFloat(service.price), 0);

        // Unimos la fecha y la hora en un solo objeto Date para guardarlo en el campo 'dateTime'
        const dateTime = new Date(`${appointmentDate}T${appointmentTime}`);

        const newAppointment = await prisma.appointment.create({
            data: {
                businessId,
                clientId: parseInt(clientId),
                dateTime: dateTime, // Usamos el nuevo campo unificado
                notes,
                cost: totalCost,
                status: 'Scheduled',
                appointmentServices: {
                    create: serviceIds.map(id => ({ serviceId: id }))
                }
            },
            include: {
                client: { select: { firstName: true, lastName: true } },
                appointmentServices: { select: { serviceId: true } }
            }
        });
        
        // Devolvemos la respuesta formateada como el frontend la espera
        res.status(201).json({
            id: newAppointment.id,
            clientId: newAppointment.clientId,
            clientFirstName: newAppointment.client.firstName,
            clientLastName: newAppointment.client.lastName,
            appointmentDate: newAppointment.dateTime.toISOString().split('T')[0],
            appointmentTime: newAppointment.dateTime.toTimeString().split(' ')[0].substring(0, 5),
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

// PUT /api/appointments/:id -> Actualizar una cita del negocio
router.put('/:id', verifyToken, async (req, res) => {
    const { id } = req.params;
    const { businessId } = req.user;
    const { clientId, appointmentDate, appointmentTime, status, notes, serviceIds } = req.body;
    
    try {
        const services = await prisma.service.findMany({
            where: { id: { in: serviceIds || [] }, businessId: businessId }
        });
        const finalCost = services.reduce((sum, service) => sum + parseFloat(service.price), 0);

        // Unimos la fecha y hora para el nuevo campo 'dateTime'
        const dateTime = new Date(`${appointmentDate}T${appointmentTime}`);

        const updatedAppointment = await prisma.appointment.update({
            where: { id: parseInt(id), businessId },
            data: {
                clientId: parseInt(clientId),
                dateTime: dateTime, // Actualizamos el campo unificado
                status,
                notes,
                cost: finalCost,
                appointmentServices: {
                    deleteMany: {},
                    create: serviceIds ? serviceIds.map(sid => ({ serviceId: sid })) : []
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
            appointmentDate: updatedAppointment.dateTime.toISOString().split('T')[0],
            appointmentTime: updatedAppointment.dateTime.toTimeString().split(' ')[0].substring(0, 5),
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

// DELETE /api/appointments/:id -> Eliminar una cita del negocio
router.delete('/:id', verifyToken, async (req, res) => {
    const { id } = req.params;
    const { businessId } = req.user;
    try {
        await prisma.appointment.delete({
            where: { id: parseInt(id), businessId }
        });
        res.status(204).send();
    } catch (error) {
        console.error("Error al eliminar la cita:", error);
        res.status(500).json({ message: "Error interno del servidor" });
    }
});

module.exports = router;