const jwt = require('jsonwebtoken');

const verifyToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Formato "Bearer TOKEN"

    if (token == null) {
        return res.sendStatus(401); // No hay token, no autorizado
    }

    jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
        if (err) {
            console.error("Error al verificar el token:", err.message);
            return res.sendStatus(403); // Token no es válido o ha expirado
        }
        req.user = user; // Guardamos los datos del usuario del token en la petición
        next(); // El token es válido, continuamos
    });
};

module.exports = { verifyToken };