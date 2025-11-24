// src/routes/reservationRoutes.js
const express = require('express');
const router = express.Router();
const reservationController = require('../controllers/reservationController');
const { verifyToken, isAdmin } = require('../middleware/authMiddleware');

// RUTAS GENERALES (Ambos roles logueados)
// POST /api/reservations -> Crear una nueva reserva
// GET /api/reservations/my -> Ver mis reservas
router.post('/', verifyToken, reservationController.requestReservation);
router.get('/my', verifyToken, reservationController.getMyReservations);

// NUEVA RUTA: Cancelación por el Empleado
// PUT /api/reservations/:id/cancel (Solo requiere verificación de token)
router.put('/:id/cancel', verifyToken, reservationController.cancelMyReservation);


// RUTAS DE ADMINISTRACIÓN (Solo Admin)
// Requieren la verificación de roles 'isAdmin'
// GET /api/reservations/all -> Obtener todas las reservas
router.get('/all', verifyToken, isAdmin, reservationController.getAllReservations);

// PUT /api/reservations/:id/status -> Aprobar/Rechazar (Gestión Admin)
router.put('/:id/status', verifyToken, isAdmin, reservationController.updateReservationStatus);

module.exports = router;