const express = require('express');
const router = express.Router();
const prisma = require('../prisma');
const { verifyToken } = require('../middleware/authMiddleware');

// GET /api/appointments
router.get('/', verifyToken, async (req, res) => {
    const { businessId } = req.user;
    try {
        const appointments = await prisma.appointment.findMany({
            where: { businessId },
            include: {
                client: { select: { firstName: true, lastName: true } },
                appointmentServices: { select: { serviceId: true } }
            },
            orderBy: { dateTime: 'desc' }
        });
        
        const formattedAppointments = appointments.map(a => ({
            id: a.id,
            clientId: a.clientId,
            clientFirstName: a.client.firstName,
            clientLastName: a.client.lastName,
            appointmentDate: a.dateTime.toISOString().split('T')[0],
            appointmentTime: a.dateTime.toTimeString().split(' ')[0].substring(0, 5),
            cost: a.cost,
            status: a.status,
            notes: a.notes,
            extraNotes: a.extraNotes,
            extraCost: a.extraCost,
            serviceIds: a.appointmentServices.map(s => s.serviceId),
        }));
        res.json(formattedAppointments);
    } catch (error) {
        console.error("Error al obtener citas:", error);
        res.status(500).json({ message: "Error interno del servidor" });
    }
});

// POST /api/appointments
router.post('/', verifyToken, async (req, res) => {
    const { businessId } = req.user;
    const { clientId, appointmentDate, appointmentTime, notes, serviceIds, extraNotes, extraCost } = req.body;

    // --- INICIO DE LA CORRECCIÓN ---
    const hasServices = serviceIds && Array.isArray(serviceIds) && serviceIds.length > 0;
    const hasExtraCost = extraCost && parseFloat(extraCost) > 0;

    if (!clientId || !appointmentDate || !appointmentTime || (!hasServices && !hasExtraCost)) {
        return res.status(400).json({ message: "Cliente, fecha, hora y al menos un servicio (o costo extra) son obligatorios." });
    }
    // --- FIN DE LA CORRECCIÓN ---

    try {
        const services = await prisma.service.findMany({
            where: { id: { in: serviceIds || [] }, businessId }
        });

        const totalCost = services.reduce((sum, service) => sum + parseFloat(service.price), 0) + (parseFloat(extraCost) || 0);
        const dateTime = new Date(`${appointmentDate}T${appointmentTime}`);

        const newAppointment = await prisma.appointment.create({
            data: {
                businessId,
                clientId: parseInt(clientId),
                dateTime,
                notes,
                cost: totalCost,
                status: 'Scheduled',
                extraNotes,
                extraCost: extraCost ? parseFloat(extraCost) : null,
                appointmentServices: { create: serviceIds ? serviceIds.map(id => ({ serviceId: id })) : [] }
            },
            include: {
                client: { select: { firstName: true, lastName: true } },
                appointmentServices: { select: { serviceId: true } }
            }
        });
        
        res.status(201).json({
            id: newAppointment.id, clientId: newAppointment.clientId,
            clientFirstName: newAppointment.client.firstName, clientLastName: newAppointment.client.lastName,
            appointmentDate: newAppointment.dateTime.toISOString().split('T')[0],
            appointmentTime: newAppointment.dateTime.toTimeString().split(' ')[0].substring(0, 5),
            cost: newAppointment.cost, status: newAppointment.status, notes: newAppointment.notes,
            extraNotes: newAppointment.extraNotes, extraCost: newAppointment.extraCost,
            serviceIds: newAppointment.appointmentServices.map(s => s.serviceId),
        });
    } catch (error) {
        console.error("Error al crear la cita:", error);
        res.status(500).json({ message: "Error interno del servidor" });
    }
});

// PUT /api/appointments/:id
router.put('/:id', verifyToken, async (req, res) => {
    const { id } = req.params;
    const { businessId } = req.user;
    const { clientId, appointmentDate, appointmentTime, status, notes, serviceIds, extraNotes, extraCost } = req.body;
    
    // --- INICIO DE LA CORRECCIÓN ---
    const hasServices = serviceIds && Array.isArray(serviceIds) && serviceIds.length > 0;
    const hasExtraCost = extraCost && parseFloat(extraCost) > 0;

    if (!clientId || !appointmentDate || !appointmentTime || (!hasServices && !hasExtraCost)) {
        return res.status(400).json({ message: "Cliente, fecha, hora y al menos un servicio (o costo extra) son obligatorios." });
    }
    // --- FIN DE LA CORRECCIÓN ---

    try {
        const services = await prisma.service.findMany({
            where: { id: { in: serviceIds || [] }, businessId }
        });
        const finalCost = services.reduce((sum, service) => sum + parseFloat(service.price), 0) + (parseFloat(extraCost) || 0);
        const dateTime = new Date(`${appointmentDate}T${appointmentTime}`);

        const updatedAppointment = await prisma.appointment.update({
            where: { id: parseInt(id), businessId },
            data: {
                clientId: parseInt(clientId), dateTime, status, notes, cost: finalCost,
                extraNotes,
                extraCost: extraCost ? parseFloat(extraCost) : null,
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
            id: updatedAppointment.id, clientId: updatedAppointment.clientId,
            clientFirstName: updatedAppointment.client.firstName, clientLastName: updatedAppointment.client.lastName,
            appointmentDate: updatedAppointment.dateTime.toISOString().split('T')[0],
            appointmentTime: updatedAppointment.dateTime.toTimeString().split(' ')[0].substring(0, 5),
            cost: updatedAppointment.cost, status: updatedAppointment.status, notes: updatedAppointment.notes,
            extraNotes: updatedAppointment.extraNotes, extraCost: updatedAppointment.extraCost,
            serviceIds: updatedAppointment.appointmentServices.map(s => s.serviceId),
        });
    } catch (error) {
        console.error("Error al actualizar la cita:", error);
        res.status(500).json({ message: "Error interno del servidor" });
    }
});

// DELETE /api/appointments/:id
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