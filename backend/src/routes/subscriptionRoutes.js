// src/routes/subscriptionRoutes.js
const express = require('express');
const router = express.Router();
const db = require('../db');
const { verifyToken } = require('../middleware/authMiddleware');

// POST /api/subscriptions -> Asigna o actualiza un plan a un negocio
router.post('/', verifyToken, async (req, res) => {
    console.log('-----------------------------------------');
    console.log('🚀 INICIANDO ASIGNACIÓN DE PLAN...');
    
    const { businessId, planId } = req.body;
    console.log(`✅ Datos recibidos del frontend: businessId=${businessId}, planId=${planId}`);

    if (!businessId || !planId) {
        console.log('❌ ERROR: Faltan IDs.');
        return res.status(400).json({ message: 'businessId y planId son obligatorios.' });
    }

    try {
        const today = new Date();
        const nextMonth = new Date(new Date().setMonth(today.getMonth() + 1));

        console.log('🔍 Buscando suscripción existente para el negocio...');
        const existingSub = await db.query('SELECT * FROM subscriptions WHERE business_id = $1', [businessId]);

        let subscription;
        if (existingSub.rows.length > 0) {
            console.log('🔄 Suscripción encontrada. Actualizando...');
            const query = `
                UPDATE subscriptions
                SET plan_id = $1, start_date = $2, end_date = $3, status = 'Active'
                WHERE business_id = $4
                RETURNING *;
            `;
            const { rows } = await db.query(query, [planId, today, nextMonth, businessId]);
            subscription = rows[0];
            console.log('✅ Suscripción ACTUALIZADA en la base de datos:', subscription);
        } else {
            console.log('✨ No existe suscripción. Creando una nueva...');
            const query = `
                INSERT INTO subscriptions (business_id, plan_id, start_date, end_date, status)
                VALUES ($1, $2, $3, $4, 'Active')
                RETURNING *;
            `;
            const { rows } = await db.query(query, [businessId, planId, today, nextMonth]);
            subscription = rows[0];
            console.log('✅ Suscripción CREADA en la base de datos:', subscription);
        }
        
        // --- INICIO DE LA CORRECCIÓN ---
        // 1. Formateamos el objeto ANTES de enviarlo
        const formattedSubscription = {
            id: subscription.id,
            businessId: subscription.business_id,
            planId: subscription.plan_id,
            status: subscription.status,
            startDate: subscription.start_date,
            endDate: subscription.end_date
        };

        // 2. Enviamos el objeto YA FORMATEADO
        console.log('✔️ Enviando respuesta formateada (camelCase) al frontend.');
        res.status(201).json(formattedSubscription);
        // --- FIN DE LA CORRECCIÓN ---

    } catch (error) {
        console.error('❌ ¡¡¡ERROR CRÍTICO DURANTE LA ASIGNACIÓN!!!', error);
        res.status(500).json({ message: 'Error interno del servidor.', error: error.message });
    }
});

// La ruta PUT ya estaba perfecta, la dejamos como está.
router.put('/:id/status', verifyToken, async (req, res) => {
    const { id } = req.params;
    const { status } = req.body;

    if (!status) {
        return res.status(400).json({ message: 'El estado es obligatorio.' });
    }

    try {
        const query = 'UPDATE subscriptions SET status = $1 WHERE id = $2 RETURNING *;';
        const { rows } = await db.query(query, [status, id]);

        if (rows.length === 0) {
            return res.status(404).json({ message: 'Suscripción no encontrada.' });
        }

        const updatedSubscriptionFromDB = rows[0];
        const formattedSubscription = {
            id: updatedSubscriptionFromDB.id,
            businessId: updatedSubscriptionFromDB.business_id,
            planId: updatedSubscriptionFromDB.plan_id,
            status: updatedSubscriptionFromDB.status,
            startDate: updatedSubscriptionFromDB.start_date,
            endDate: updatedSubscriptionFromDB.end_date
        };
        res.json(formattedSubscription);

    } catch (error) {
        console.error("Error al actualizar el estado de la suscripción:", error);
        res.status(500).json({ message: 'Error interno del servidor.' });
    }
});

module.exports = router;