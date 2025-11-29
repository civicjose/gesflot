const express = require('express');
const router = express.Router();
const vehicleController = require('../controllers/vehicleController');
const { verifyToken, isAdmin } = require('../middleware/authMiddleware');

// Rutas CRUD
// Leer lo puede hacer cualquiera registrado
router.get('/', verifyToken, vehicleController.getAllVehicles);

// Crear, editar y borrar solo el admin
router.post('/', verifyToken, isAdmin, vehicleController.createVehicle);

router.get('/:id', verifyToken, isAdmin, vehicleController.getVehicleById);
router.put('/:id', verifyToken, isAdmin, vehicleController.updateVehicle);
router.delete('/:id', verifyToken, isAdmin, vehicleController.deleteVehicle);

module.exports = router;