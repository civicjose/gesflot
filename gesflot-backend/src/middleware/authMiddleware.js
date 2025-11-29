// src/middleware/authMiddleware.js
const jwt = require('jsonwebtoken');

// Middleware para ver si trae el token
exports.verifyToken = (req, res, next) => {
    const cabecera = req.header('Authorization');
    
    if (!cabecera) {
        return res.status(401).json({ message: 'No tienes permiso. Falta el token.' });
    }

    // Quitamos la palabra "Bearer "
    const token = cabecera.split(' ')[1];

    try {
        const verificado = jwt.verify(token, process.env.JWT_SECRET);
        req.user = verificado; // Guardamos al usuario en la petición
        next();
    } catch (error) {
        res.status(400).json({ message: 'El token no vale o ha caducado.' });
    }
};

// Middleware para ver si es jefe (Admin)
exports.isAdmin = (req, res, next) => {
    if (req.user.role !== 'admin') {
        return res.status(403).json({ message: 'Acceso prohibido. Solo administradores.' });
    }
    next();
};