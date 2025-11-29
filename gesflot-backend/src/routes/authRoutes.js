const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

// Rutas públicas de acceso
router.post('/register', authController.register);
router.post('/login', authController.login);

module.exports = router;