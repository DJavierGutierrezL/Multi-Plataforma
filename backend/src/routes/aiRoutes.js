const express = require('express');
const router = express.Router();
const db = require('../db');
const { verifyToken } = require('../middleware/authMiddleware');

router.post('/generate-message', verifyToken, async (req, res) => {
    const { clientId, messageType, businessName } = req.body;
    const businessId = req.user.businessId;

    if (!clientId || !messageType || !businessName) {
        return res.status(400).json({ message: "Faltan datos para generar el mensaje." });
    }

    try {
        const clientRes = await db.query('SELECT first_name FROM clients WHERE id = $1 AND business_id = $2', [clientId, businessId]);
        if (clientRes.rows.length === 0) {
            return res.status(404).json({ message: "Cliente no encontrado." });
        }
        const clientName = clientRes.rows[0].first_name;

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
                const appointmentRes = await db.query(
                    `SELECT a.cost, a.appointment_date, array_agg(s.name) as service_names
                     FROM appointments a
                     LEFT JOIN appointment_services aps ON a.id = aps.appointment_id
                     LEFT JOIN services s ON aps.service_id = s.id
                     WHERE a.client_id = $1 AND a.status = 'Falta Pago'
                     GROUP BY a.id
                     ORDER BY a.appointment_date DESC, a.appointment_time DESC
                     LIMIT 1`,
                    [clientId]
                );

                if (appointmentRes.rows.length > 0) {
                    const { cost, appointment_date, service_names } = appointmentRes.rows[0];
                    const businessRes = await db.query('SELECT account_number FROM businesses WHERE id = $1', [businessId]);
                    const accountNumber = businessRes.rows[0]?.account_number;

                    const formattedDate = new Date(appointment_date).toLocaleDateString('es-ES', { day: 'numeric', month: 'long' });
                    const formattedCost = new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', minimumFractionDigits: 0 }).format(cost);
                    const servicesList = service_names.join(', ') || 'los servicios prestados';

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