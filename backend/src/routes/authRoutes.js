const express = require('express');
const router = express.Router();
const db = require('../db');
const jwt = require('jsonwebtoken');

router.post('/login', async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ message: 'Usuario y contraseña son obligatorios.' });
  }

  try {
    const { rows } = await db.query('SELECT * FROM users WHERE username = $1', [username]);
    if (rows.length === 0) {
      return res.status(401).json({ message: 'Credenciales inválidas.' });
    }

    const user = rows[0];

    // Usamos la comparación de texto plano de la solución de emergencia
    if (password !== user.password_hash) {
      return res.status(401).json({ message: 'Credenciales inválidas.' });
    }

    const payload = { id: user.id, role: user.role, businessId: user.business_id };
    const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '365d' });
    
    // --- INICIO DE LA CORRECCIÓN ---
    // Nos aseguramos de incluir 'businessId' en la respuesta.
    const formattedUser = { 
      id: user.id, 
      username: user.username, 
      role: user.role,
      businessId: user.business_id // <-- ESTA LÍNEA FALTABA
    };
    // --- FIN DE LA CORRECCIÓN ---

    res.json({ user: formattedUser, token, business: null });

  } catch (error) {
    console.error("Error en el inicio de sesión:", error);
    res.status(500).json({ message: 'Error interno del servidor.' });
  }
});

router.get('/me', require('../middleware/authMiddleware').verifyToken, (req, res) => {
  res.json({ user: req.user });
});


module.exports = router;