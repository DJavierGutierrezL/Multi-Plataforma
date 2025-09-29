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
        // Detective #1: Confirmamos que el usuario se adjunta a la petición
        console.log('Middleware: Token verificado, usuario adjuntado:', req.user);
        
        next();
    });
};

module.exports = { verifyToken };
