const express = require('express');
const router = express.Router();
const prisma = require('../prisma'); // <- Usamos la conexión centralizada de Prisma
const { verifyToken } = require('../middleware/authMiddleware');

// POST /api/businesses -> Crear un nuevo negocio (solo SuperAdmin)
router.post('/', verifyToken, async (req, res) => {
    if (req.user.role !== 'SuperAdmin') {
        return res.status(403).json({ message: 'Acceso denegado.' });
    }
    const { salonName, type } = req.body;
    if (!salonName || !type) {
        return res.status(400).json({ message: 'Nombre y tipo son obligatorios.' });
    }
    try {
        const newBusiness = await prisma.business.create({
            data: {
                salonName: salonName,
                type: type,
                // Valores por defecto definidos en el schema
            }
        });
        const formattedBusiness = {
            id: newBusiness.id,
            type: newBusiness.type,
            profile: { salonName: newBusiness.salonName },
            themeSettings: {
                primaryColor: 'Rosa', // Valor inicial por defecto
                backgroundColor: 'Blanco' // Valor inicial por defecto
            }
        };
        res.status(201).json(formattedBusiness);
    } catch (error) {
        console.error("Error al crear el negocio:", error);
        res.status(500).json({ message: 'Error interno del servidor.' });
    }
});

// GET /api/businesses/my-data -> Obtener todos los datos del negocio del usuario logueado
router.get('/my-data', verifyToken, async (req, res) => {
    const { businessId } = req.user;
    if (!businessId) {
        return res.status(403).json({ message: "Usuario no asignado a un negocio." });
    }
    try {
        // Con Prisma, podemos traer todos los datos relacionados en una sola consulta eficiente
        const businessData = await prisma.business.findUnique({
            where: { id: businessId },
            include: {
                subscriptions: true,
                clients: { orderBy: { firstName: 'asc' } },
                services: { orderBy: { name: 'asc' } },
                appointments: {
                    include: {
                        client: { select: { firstName: true, lastName: true } },
                        appointmentServices: { select: { serviceId: true } }
                    },
                    orderBy: [{ appointmentDate: 'desc' }, { appointmentTime: 'asc' }]
                }
            }
        });

        if (!businessData) {
            return res.status(404).json({ message: "El negocio asignado no fue encontrado." });
        }
        
        // El frontend espera los planes globales, no solo los del negocio
        const allPlans = await prisma.plan.findMany();
        
        // Formateamos los datos para que coincidan con la estructura esperada por el frontend
        const formattedBusiness = {
            id: businessData.id,
            type: businessData.type,
            profile: { salonName: businessData.salonName, accountNumber: businessData.accountNumber },
            themeSettings: {
                primaryColor: businessData.themePrimaryColor === 'Pink' ? 'Rosa' : businessData.themePrimaryColor,
                backgroundColor: businessData.themeBackgroundColor
            }
        };

        const formattedAppointments = businessData.appointments.map(a => ({
            id: a.id,
            clientId: a.clientId,
            clientFirstName: a.client.firstName,
            clientLastName: a.client.lastName,
            appointmentDate: a.appointmentDate.toISOString().split('T')[0],
            appointmentTime: a.appointmentTime,
            cost: a.cost,
            status: a.status,
            notes: a.notes,
            serviceIds: a.appointmentServices.map(s => s.serviceId)
        }));

        res.json({
            business: formattedBusiness,
            plans: allPlans,
            subscriptions: businessData.subscriptions,
            clients: businessData.clients,
            services: businessData.services,
            appointments: formattedAppointments,
            payments: [] // Se mantiene vacío por ahora
        });
    } catch (error) {
        console.error("----------- ERROR CRÍTICO EN /my-data -----------", error);
        res.status(500).json({ message: 'Error interno del servidor al cargar datos del negocio.' });
    }
});

// PUT /api/businesses/profile -> Actualizar el perfil del negocio
router.put('/profile', verifyToken, async (req, res) => {
    const { businessId } = req.user;
    const { salonName, accountNumber } = req.body;
    try {
        const updatedBusiness = await prisma.business.update({
            where: { id: businessId },
            data: {
                salonName: salonName,
                accountNumber: accountNumber
            },
            select: {
                salonName: true,
                accountNumber: true
            }
        });
        res.json(updatedBusiness);
    } catch (error) {
        console.error("Error al actualizar perfil:", error);
        res.status(500).json({ message: 'Error interno.' });
    }
});

// DELETE /api/businesses/:id -> Eliminar un negocio (solo SuperAdmin)
router.delete('/:id', verifyToken, async (req, res) => {
    if (req.user.role !== 'SuperAdmin') {
        return res.status(403).json({ message: 'Acceso denegado.' });
    }
    const { id } = req.params;
    try {
        await prisma.business.delete({
            where: { id: parseInt(id) }
        });
        res.status(204).send();
    } catch (error) {
        console.error("Error al eliminar el negocio:", error);
        res.status(500).json({ message: 'Error interno del servidor.' });
    }
});

// PUT /api/businesses/theme -> Actualizar el tema de un negocio
router.put('/theme', verifyToken, async (req, res) => {
    const { primaryColor, backgroundColor } = req.body;
    // SuperAdmin puede editar otros negocios, los usuarios solo el suyo
    const businessIdToUpdate = req.user.role === 'SuperAdmin' ? req.body.businessIdForAdmin : req.user.businessId;

    if (!primaryColor || !backgroundColor || !businessIdToUpdate) {
        return res.status(400).json({ message: "Se requieren colores y ID de negocio." });
    }
    
    // Convertimos 'Rosa' a 'Pink' para la base de datos
    const primaryColorForDb = primaryColor === 'Rosa' ? 'Pink' : primaryColor;

    try {
        const updatedBusiness = await prisma.business.update({
            where: { id: businessIdToUpdate },
            data: {
                themePrimaryColor: primaryColorForDb,
                themeBackgroundColor: backgroundColor,
            },
            select: {
                themePrimaryColor: true,
                themeBackgroundColor: true,
            }
        });

        const updatedTheme = {
            primaryColor: updatedBusiness.themePrimaryColor === 'Pink' ? 'Rosa' : updatedBusiness.themePrimaryColor,
            backgroundColor: updatedBusiness.themeBackgroundColor
        };
        res.json(updatedTheme);

    } catch (error) {
        console.error("Error al actualizar el tema:", error);
        res.status(500).json({ message: 'Error interno del servidor.' });
    }
});

module.exports = router;