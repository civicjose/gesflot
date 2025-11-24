// src/routes/userRoutes.js
const express = require('express');
const router = express.Router();
const { verifyToken, isAdmin } = require('../middleware/authMiddleware');
const db = require('../config/db');
const userController = require('../controllers/userController');

// Ruta de Perfil
router.get('/profile', verifyToken, async (req, res) => {
    try {
        const [rows] = await db.query('SELECT id, name, email, role FROM users WHERE id = ?', [req.user.id]);
        if (rows.length === 0) return res.status(404).json({ message: 'Usuario no encontrado' });
        res.json(rows[0]);
    } catch (error) {
        res.status(500).json({ message: 'Error al obtener perfil' });
    }
});

// --- RUTAS DE ADMINISTRACIÓN ---

// GET /api/users -> Listar
router.get('/', verifyToken, isAdmin, userController.getAllUsers);

// POST /api/users -> Crear Usuario (NUEVA)
router.post('/', verifyToken, isAdmin, userController.createUser);

// DELETE /api/users/:id -> Borrar
router.delete('/:id', verifyToken, isAdmin, userController.deleteUser);

// PUT /api/users/:id/role -> Cambiar rol
router.put('/:id/role', verifyToken, isAdmin, userController.updateUserRole);

module.exports = router;