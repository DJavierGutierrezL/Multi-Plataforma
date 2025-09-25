const express = require('express');
const router = express.Router();
const db = require('../db');
const { verifyToken } = require('../middleware/authMiddleware');
const bcrypt = require('bcrypt');

router.post('/', verifyToken, async (req, res) => {
  const { firstName, lastName, phone, username, password, businessId } = req.body;

  if (!username || !password || !firstName || !lastName) {
    return res.status(400).json({ message: 'Nombre, apellido, usuario y contraseña son obligatorios.' });
  }

  try {
    const saltRounds = 10;
    const passwordHash = await bcrypt.hash(password, saltRounds);
    const query = `
      INSERT INTO users (first_name, last_name, phone, username, password_hash, business_id, role)
      VALUES ($1, $2, $3, $4, $5, $6, 'User')
      RETURNING id, first_name, last_name, phone, username, business_id, role;
    `;
    
    // --- INICIO DE LA ÚLTIMA MODIFICACIÓN ---
    // Convertimos businessId a String para intentar evitar el error del driver.
    const queryParams = [
      firstName, 
      lastName, 
      phone, 
      username, 
      passwordHash, 
      businessId ? String(businessId) : null
    ];
    // --- FIN DE LA ÚLTIMA MODIFICACIÓN ---

    const { rows } = await db.query(query, queryParams);
    res.status(201).json(rows[0]);

  } catch (error) {
    if (error.code === '23505') { 
      return res.status(409).json({ message: 'El nombre de usuario ya existe.' });
    }
    console.error("Error al crear el usuario:", error);
    res.status(500).json({ message: 'Error interno del servidor.' });
  }
});

router.delete('/:id', verifyToken, async (req, res) => {
    // Solo un SuperAdmin puede eliminar usuarios
    if (req.user.role !== 'SuperAdmin') {
        return res.status(403).json({ message: 'Acceso denegado.' });
    }

    const { id } = req.params;

    try {
        const result = await db.query('DELETE FROM users WHERE id = $1', [id]);

        if (result.rowCount === 0) {
            return res.status(404).json({ message: 'Usuario no encontrado.' });
        }

        res.status(204).send(); // Éxito sin contenido

    } catch (error) {
        console.error("Error al eliminar el usuario:", error);
        res.status(500).json({ message: 'Error interno del servidor.' });
    }
});

module.exports = router;