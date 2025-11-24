// src/routes/vehicleRoutes.js
const express = require('express');
const router = express.Router();
const vehicleController = require('../controllers/vehicleController');
const { verifyToken, isAdmin } = require('../middleware/authMiddleware');

// RUTAS CRUD COMPLETAS

// La lectura (GET) solo requiere que el usuario esté logueado (verifyToken).
// La creación (POST) sigue requiriendo ser Administrador (isAdmin).
router.route('/')
    .get(verifyToken, vehicleController.getAllVehicles) // <-- Eliminado isAdmin
    .post(verifyToken, isAdmin, vehicleController.createVehicle);

// GET, PUT y DELETE por ID (siguen siendo solo para Admin, excepto el GET, que se maneja arriba si es necesario)
// Nota: Dejamos PUT y DELETE con isAdmin, ya que solo el Admin gestiona los vehículos.
router.route('/:id')
    .get(verifyToken, isAdmin, vehicleController.getVehicleById)
    .put(verifyToken, isAdmin, vehicleController.updateVehicle)
    .delete(verifyToken, isAdmin, vehicleController.deleteVehicle);

module.exports = router;