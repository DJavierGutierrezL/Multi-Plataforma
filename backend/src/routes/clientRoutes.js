// backend/src/routes/clientRoutes.js
const express = require('express');
const router = express.Router();
const db = require('../db');
const { verifyToken } = require('../middleware/authMiddleware');

// Función auxiliar para formatear clientes y mantener el código limpio
const formatClient = (client) => ({
    id: client.id,
    firstName: client.first_name,
    lastName: client.last_name,
    phone: client.phone,
    email: client.email,
    notes: client.notes,
    businessId: client.business_id,
    createdAt: client.created_at,
    birthDate: client.birth_date
});

// GET /api/clients -> Obtener todos los clientes del negocio del usuario
router.get('/', verifyToken, async (req, res) => {
    const businessId = req.user.businessId;
    try {
        const { rows } = await db.query('SELECT * FROM clients WHERE business_id = $1 ORDER BY first_name ASC', [businessId]);
        res.json(rows.map(formatClient)); // <-- Usamos la función de formato
    } catch (error) {
        console.error("Error al obtener clientes:", error);
        res.status(500).json({ message: "Error interno del servidor" });
    }
});

// POST /api/clients -> Crear un nuevo cliente
router.post('/', verifyToken, async (req, res) => {
    const businessId = req.user.businessId;
    const { firstName, lastName, phone, email, notes, birthDate } = req.body; // <-- Recibimos camelCase

    if (!firstName || !phone) {
        return res.status(400).json({ message: "El nombre y el teléfono son obligatorios." });
    }
    try {
        const query = `
            INSERT INTO clients (first_name, last_name, phone, email, notes, business_id, birth_date)
            VALUES ($1, $2, $3, $4, $5, $6, $7)
            RETURNING *;
        `;
        const { rows } = await db.query(query, [firstName, lastName, phone, email, notes, businessId, birthDate || null]);
        
        // --- CORRECCIÓN ---
        // Formateamos la respuesta antes de enviarla
        res.status(201).json(formatClient(rows[0]));

    } catch (error) {
        if (error.code === '23505') {
            return res.status(409).json({ message: "Un cliente con este número de teléfono ya existe." });
        }
        console.error("Error al crear cliente:", error);
        res.status(500).json({ message: "Error interno del servidor" });
    }
});

// PUT /api/clients/:id -> Actualizar un cliente existente
router.put('/:id', verifyToken, async (req, res) => {
    const { id } = req.params;
    const { firstName, lastName, phone, email, notes, birthDate } = req.body; // <-- Recibimos camelCase
    const businessId = req.user.businessId;
    try {
        const query = `
            UPDATE clients 
            SET first_name = $1, last_name = $2, phone = $3, email = $4, notes = $5, birth_date = $6
            WHERE id = $7 AND business_id = $8
            RETURNING *;
        `;
        const { rows } = await db.query(query, [firstName, lastName, phone, email, notes, birthDate || null, id, businessId]);
        
        if (rows.length === 0) {
            return res.status(404).json({ message: "Cliente no encontrado o no pertenece a tu negocio." });
        }
        
        // --- CORRECCIÓN ---
        // Formateamos la respuesta antes de enviarla
        res.json(formatClient(rows[0]));

    } catch (error) {
        console.error("Error al actualizar cliente:", error);
        res.status(500).json({ message: "Error interno del servidor" });
    }
});

// DELETE /api/clients/:id (sin cambios, no devuelve un cliente)
router.delete('/:id', verifyToken, async (req, res) => {
    console.log("--- INICIANDO PETICIÓN DELETE /api/clients/:id ---");
    const { id } = req.params;
    const businessId = req.user.businessId;

    console.log(`ID de cliente a eliminar: ${id}, del negocio: ${businessId}`);

    if (!id || !businessId) {
        console.log("Error: Falta el ID del cliente o del negocio.");
        return res.status(400).json({ message: "Falta información." });
    }

    try {
        console.log("Ejecutando consulta DELETE en la base de datos...");
        const query = `DELETE FROM clients WHERE id = $1 AND business_id = $2;`;
        const result = await db.query(query, [id, businessId]);
        console.log("Consulta completada. Filas afectadas:", result.rowCount);

        if (result.rowCount === 0) {
            console.log("Advertencia: No se encontró el cliente para eliminar. Devolviendo 404.");
            return res.status(404).json({ message: "Cliente no encontrado." });
        }

        console.log("Éxito. Enviando respuesta 204 (sin contenido).");
        res.status(204).send();

    } catch (error) {
        console.error("--- ERROR CRÍTICO AL ELIMINAR ---", error);
        res.status(500).json({ message: "Error interno del servidor" });
    }
});

module.exports = router;