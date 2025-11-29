const express = require('express');
const router = express.Router();
const { verifyToken, isAdmin } = require('../middleware/authMiddleware');
const db = require('../config/db');
const userController = require('../controllers/userController');

// Perfil propio
router.get('/profile', verifyToken, async (req, res) => {
    try {
        const [filas] = await db.query('SELECT id, name, email, role FROM users WHERE id = ?', [req.user.id]);
        if (filas.length === 0) return res.status(404).json({ message: 'Usuario no encontrado' });
        res.json(filas[0]);
    } catch (error) {
        res.status(500).json({ message: 'Error de perfil' });
    }
});

// Rutas de Admin
router.get('/', verifyToken, isAdmin, userController.getAllUsers);
router.post('/', verifyToken, isAdmin, userController.createUser);
router.delete('/:id', verifyToken, isAdmin, userController.deleteUser);
router.put('/:id/role', verifyToken, isAdmin, userController.updateUserRole);

module.exports = router;