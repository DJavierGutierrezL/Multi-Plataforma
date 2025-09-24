// backend/src/routes/aiRoutes.js
const express = require('express');
const router = express.Router();
const { verifyToken } = require('../middleware/authMiddleware');

// POST /api/ai/generate-message
router.post('/generate-message', verifyToken, (req, res) => {
    const { clientName, messageType, businessName } = req.body;

    if (!clientName || !messageType || !businessName) {
        return res.status(400).json({ message: "Faltan datos para generar el mensaje." });
    }

    let message = '';

    // Lógica (simulada) de la IA para generar el mensaje
    switch (messageType) {
        case 'Confirmacion':
            message = `¡Hola ${clientName}! 👋 Te confirmamos tu próxima cita en ${businessName}. ¡Te esperamos! ✨`;
            break;
        case 'Promocion':
            message = `¡Hola ${clientName}! 🎉 En ${businessName} tenemos una promoción especial para ti. Muestra este mensaje y obtén un 20% de descuento en tu próximo servicio. ¡No te lo pierdas!`;
            break;
        case 'Cumpleaños':
            message = `¡Feliz cumpleaños, ${clientName}! 🎂 De parte de todo el equipo de ${businessName}, te deseamos un día increíble. ¡Ven a celebrar con nosotros y recibe un regalo especial! 🎁`;
            break;
        case 'Falta Pago':
            message = `Hola ${clientName}, te saludamos de ${businessName}. Te recordamos amablemente que tienes un pago pendiente. Puedes contactarnos para más detalles. ¡Gracias!`;
            break;
        default:
            message = `Hola ${clientName}, saludos desde ${businessName}.`;
            break;
    }

    // Devolvemos el mensaje generado
    res.json({ generatedMessage: message });
});

module.exports = router;