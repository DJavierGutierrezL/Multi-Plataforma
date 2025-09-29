const jwt = require('jsonwebtoken');

const verifyToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (token == null) {
        return res.sendStatus(401);
    }

    jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
        if (err) {
            console.error("Error al verificar el token:", err.message);
            return res.sendStatus(403);
        }
        
        req.user = user;
        // --- INICIO DE LA MODIFICACIÓN (DETECTIVE #1) ---
        console.log('Middleware: Token verificado, usuario adjuntado:', req.user);
        // --- FIN DE LA MODIFICACIÓN ---
        
        next();
    });
};

module.exports = { verifyToken };
```eof

#### **2. Modificar `routes/authRoutes.js`**

Ahora, añadiremos un log justo en la ruta `/me` para ver qué información llega a ese punto.

```javascript:routes/authRoutes.js
const express = require('express');
const router = express.Router();
const db = require('../db');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');

router.post('/login', async (req, res) => {
  // ... tu código de login permanece igual ...
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
    const passwordIsValid = await bcrypt.compare(password, user.password_hash);

    if (!passwordIsValid) {
      return res.status(401).json({ message: 'Credenciales inválidas.' });
    }

    const payload = { id: user.id, role: user.role, businessId: user.business_id };
    const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '365d' });
    
    const formattedUser = { 
      id: user.id, 
      username: user.username, 
      role: user.role,
      businessId: user.business_id
    };

    res.json({ user: formattedUser, token, business: null });

  } catch (error) {
    console.error("Error en el inicio de sesión:", error);
    res.status(500).json({ message: 'Error interno del servidor.' });
  }
});

router.get('/me', require('../middleware/authMiddleware').verifyToken, (req, res) => {
  // --- INICIO DE LA MODIFICACIÓN (DETECTIVE #2) ---
  console.log('Ruta /me: Recibido req.user:', req.user);
  // --- FIN DE LA MODIFICACIÓN ---
  
  res.json({ user: req.user });
});

module.exports = router;
