const express = require('express');
const router = express.Router();
const prisma = require('../prisma'); // <- Usamos la conexión centralizada de Prisma
const { verifyToken } = require('../middleware/authMiddleware');
const bcrypt = require('bcrypt');

// POST /api/users -> Crear un nuevo usuario
router.post('/', verifyToken, async (req, res) => {
    // Solo un SuperAdmin puede crear usuarios nuevos directamente
    if (req.user.role !== 'SuperAdmin') {
        return res.status(403).json({ message: 'Acceso denegado.' });
    }
  
    const { firstName, lastName, phone, username, password, businessId } = req.body;

    if (!username || !password || !firstName || !lastName) {
        return res.status(400).json({ message: 'Nombre, apellido, usuario y contraseña son obligatorios.' });
    }

    try {
        const saltRounds = 10;
        const passwordHash = await bcrypt.hash(password, saltRounds);
        
        // Se usa el método 'create' de Prisma
        const newUser = await prisma.user.create({
            data: {
                firstName,
                lastName,
                phone,
                username,
                passwordHash, // Prisma usa camelCase
                businessId: businessId ? parseInt(businessId) : null, // Prisma maneja los tipos correctamente
                role: 'User'
            }
        });

        // Excluimos el hash de la contraseña de la respuesta por seguridad
        const { passwordHash: removedPassword, ...userToReturn } = newUser;
        res.status(201).json(userToReturn);

    } catch (error) {
        // Se actualiza el código de error para duplicados de Prisma
        if (error.code === 'P2002' && error.meta?.target?.includes('username')) { 
            return res.status(409).json({ message: 'El nombre de usuario ya existe.' });
        }
        console.error("Error al crear el usuario:", error);
        res.status(500).json({ message: 'Error interno del servidor.' });
    }
});

// DELETE /api/users/:id -> Eliminar un usuario
router.delete('/:id', verifyToken, async (req, res) => {
    // Solo un SuperAdmin puede eliminar usuarios
    if (req.user.role !== 'SuperAdmin') {
        return res.status(403).json({ message: 'Acceso denegado.' });
    }

    const { id } = req.params;

    try {
        // Se usa el método 'delete' de Prisma
        await prisma.user.delete({
            where: { id: parseInt(id) }
        });

        res.status(204).send(); // Éxito sin contenido

    } catch (error) {
        // Se actualiza el código de error para "registro no encontrado" de Prisma
        if (error.code === 'P2025') {
            return res.status(404).json({ message: 'Usuario no encontrado.' });
        }
        console.error("Error al eliminar el usuario:", error);
        res.status(500).json({ message: 'Error interno del servidor.' });
    }
});

module.exports = router;