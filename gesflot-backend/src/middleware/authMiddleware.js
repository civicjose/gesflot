// src/middleware/authMiddleware.js
const jwt = require('jsonwebtoken');

// 1. Middleware para verificar que el usuario tiene un Token válido
exports.verifyToken = (req, res, next) => {
    // El token suele venir en el header así: "Authorization: Bearer <token>"
    const authHeader = req.header('Authorization');
    
    if (!authHeader) {
        return res.status(401).json({ message: 'Acceso denegado. No hay token.' });
    }

    // Separamos la palabra "Bearer" del token en sí
    const token = authHeader.split(' ')[1];

    try {
        // Verificamos el token con nuestra clave secreta
        const verified = jwt.verify(token, process.env.JWT_SECRET);
        
        // Si es válido, guardamos los datos del usuario en la petición (req.user)
        // Así podremos saber quién es en los siguientes pasos
        req.user = verified;
        
        next(); // Continuamos a la siguiente función (la ruta real)
    } catch (error) {
        res.status(400).json({ message: 'Token no válido o expirado.' });
    }
};

// 2. Middleware para verificar si el usuario es Administrador
exports.isAdmin = (req, res, next) => {
    // Como ya ejecutamos verifyToken antes, tenemos acceso a req.user
    if (req.user.role !== 'admin') {
        return res.status(403).json({ message: 'Acceso denegado. Se requieren permisos de administrador.' });
    }
    next();
};