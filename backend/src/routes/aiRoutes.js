const express = require('express');
const router = express.Router();
const prisma = require('../prisma'); // <- Usamos la conexión centralizada de Prisma
const { verifyToken } = require('../middleware/authMiddleware');

router.post('/generate-message', verifyToken, async (req, res) => {
    const { clientId, messageType, businessName } = req.body;
    const { businessId } = req.user;

    if (!clientId || !messageType || !businessName) {
        return res.status(400).json({ message: "Faltan datos para generar el mensaje." });
    }

    try {
        // 1. Buscamos al cliente usando Prisma
        const client = await prisma.client.findFirst({
            where: {
                id: parseInt(clientId),
                businessId: businessId
            }
        });

        if (!client) {
            return res.status(404).json({ message: "Cliente no encontrado en este negocio." });
        }
        const clientName = client.firstName;

        let message = '';

        switch (messageType) {
            case 'Confirmacion':
                message = `¡Hola, ${clientName}! 👋 Soy Kandy AI, el asistente virtual de ${businessName}.\n\nSolo para confirmar tu cita con nosotros. ¡Te esperamos! ✨`;
                break;
            case 'Promocion':
                message = `¡Hola, ${clientName}! 🎉 En ${businessName} tenemos una promoción especial para ti. Muestra este mensaje y obtén un 20% de descuento en tu próximo servicio. ¡No te lo pierdas!`;
                break;
            case 'Cumpleaños':
                message = `¡Feliz cumpleaños, ${clientName}! 🎂 De parte de todo el equipo de ${businessName}, te deseamos un día increíble. ¡Ven a celebrar con nosotros y recibe un regalo especial! 🎁`;
                break;
            case 'Falta Pago':
                // 2. Buscamos la cita pendiente de pago con Prisma
                const appointment = await prisma.appointment.findFirst({
                    where: {
                        clientId: parseInt(clientId),
                        businessId: businessId,
                        status: 'Falta Pago',
                    },
                    include: { // Incluimos los datos relacionados que necesitamos
                        appointmentServices: {
                            include: {
                                service: {
                                    select: { name: true }
                                }
                            }
                        },
                        business: { // Obtenemos el número de cuenta del negocio
                            select: { accountNumber: true }
                        }
                    },
                    orderBy: {
                        appointmentDate: 'desc'
                    }
                });

                if (appointment) {
                    const { cost, appointmentDate, appointmentServices, business } = appointment;
                    const accountNumber = business.accountNumber;

                    const formattedDate = new Date(appointmentDate).toLocaleDateString('es-ES', { day: 'numeric', month: 'long' });
                    const formattedCost = new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', minimumFractionDigits: 0 }).format(cost);
                    const servicesList = appointmentServices.map(s => s.service.name).join(', ') || 'los servicios prestados';

                    message = `¡Hola, ${clientName}! 👋 Soy Kandy AI, el asistente virtual de ${businessName}.\n\nQueríamos recordarte el pago pendiente de ${formattedCost} por tus servicios de ${servicesList} del ${formattedDate}.\n\nPuedes realizar el pago por transferencia a:\n${accountNumber || 'Nro. de cuenta no configurado en Ajustes'}\n\n¡Gracias por tu atención!\nUn cordial saludo,\n${businessName}`;
                } else {
                    message = `Hola ${clientName}, no encontramos citas con pago pendiente para ti. ¡Gracias por estar al día!`;
                }
                break;
            default:
                message = `Hola ${clientName}, saludos desde ${businessName}.`;
                break;
        }
        res.json({ generatedMessage: message });

    } catch (error) {
        console.error("Error al generar mensaje de IA:", error);
        res.status(500).json({ message: "Error interno del servidor." });
    }
});

module.exports = router;