const express = require('express');
const router = express.Router();
const reservationController = require('../controllers/reservationController');
const { verifyToken, isAdmin } = require('../middleware/authMiddleware');

// Rutas para todos los usuarios
router.post('/', verifyToken, reservationController.requestReservation);
router.get('/my', verifyToken, reservationController.getMyReservations);
router.put('/:id/cancel', verifyToken, reservationController.cancelMyReservation);
router.get('/availability', verifyToken, reservationController.getAvailability);
router.put('/:id/cancel', verifyToken, reservationController.cancelMyReservation);

// Rutas solo Admin
router.get('/all', verifyToken, isAdmin, reservationController.getAllReservations);
router.put('/:id/status', verifyToken, isAdmin, reservationController.updateReservationStatus);

module.exports = router;