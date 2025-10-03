const express = require('express');
const router = express.Router();
const prisma = require('../prisma'); // <- Usamos la conexión centralizada de Prisma
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const { verifyToken } = require('../middleware/authMiddleware'); // Importamos el middleware

// POST /api/auth/login -> Iniciar sesión de un usuario
router.post('/login', async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ message: 'Usuario y contraseña son obligatorios.' });
  }

  try {
    // 1. Buscamos al usuario por su 'username' usando Prisma
    const user = await prisma.user.findUnique({
      where: { username: username },
    });

    // 2. Si no se encuentra el usuario, las credenciales son inválidas
    if (!user) {
      return res.status(401).json({ message: 'Credenciales inválidas.' });
    }

    // 3. Comparamos la contraseña enviada con el hash guardado en la base de datos
    const passwordIsValid = await bcrypt.compare(password, user.passwordHash);

    if (!passwordIsValid) {
      return res.status(401).json({ message: 'Credenciales inválidas.' });
    }

    // 4. Creamos el payload para el token con los datos del usuario
    const payload = { 
        id: user.id, 
        role: user.role, 
        businessId: user.businessId 
    };
    const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '365d' });
    
    // 5. Quitamos el hash de la contraseña antes de enviar el objeto de usuario al frontend
    const { passwordHash, ...userWithoutPassword } = user;

    res.json({ user: userWithoutPassword, token, business: null });

  } catch (error) {
    console.error("Error en el inicio de sesión:", error);
    res.status(500).json({ message: 'Error interno del servidor.' });
  }
});

// GET /api/auth/me -> Verifica el token y devuelve los datos del usuario
router.get('/me', verifyToken, (req, res) => {
  // El middleware 'verifyToken' ya ha hecho el trabajo y ha adjuntado el usuario a 'req.user'
  res.json({ user: req.user });
});


module.exports = router;