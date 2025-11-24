// src/controllers/reservationController.js
const Reservation = require('../models/reservationModel');

// 1. Solicitar nueva reserva (POST /api/reservations)
exports.requestReservation = async (req, res) => {
    try {
        const { vehicle_id, start_time, end_time } = req.body;
        const user_id = req.user.id; 

        if (new Date(start_time) >= new Date(end_time)) {
             return res.status(400).json({ message: 'La fecha de inicio debe ser anterior a la fecha de fin.' });
        }
        
        const isAvailable = await Reservation.checkAvailability(vehicle_id, start_time, end_time);

        if (!isAvailable) {
            return res.status(409).json({ message: 'El vehículo no está disponible en el período solicitado (Overbooking).' });
        }

        const reservationId = await Reservation.create({ user_id, vehicle_id, start_time, end_time });
        
        res.status(201).json({ 
            message: 'Solicitud de reserva enviada correctamente (Pendiente de aprobación)', 
            id: reservationId 
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error al solicitar la reserva' });
    }
};

// 2. Obtener todas las reservas (Solo Admin)
exports.getAllReservations = async (req, res) => {
    try {
        const reservations = await Reservation.findAll();
        res.json(reservations);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error al obtener la lista de reservas' });
    }
};

// 3. Aprobar o Rechazar reserva (Solo Admin - PUT /api/reservations/:id/status)
exports.updateReservationStatus = async (req, res) => {
    try {
        const { status } = req.body; 
        
        if (!['approved', 'rejected', 'canceled', 'completed'].includes(status)) {
            return res.status(400).json({ message: 'Estado de reserva no válido.' });
        }
        
        const rowsAffected = await Reservation.updateStatus(req.params.id, status);

        if (rowsAffected === 0) {
            return res.status(404).json({ message: 'Reserva no encontrada.' });
        }

        res.json({ message: `Reserva ${req.params.id} actualizada a ${status}.` });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error al actualizar el estado de la reserva' });
    }
};

// 4. Ver mis reservas (Empleado)
exports.getMyReservations = async (req, res) => {
    try {
        const reservations = await Reservation.findByUser(req.user.id); 
        res.json(reservations);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error al obtener mis reservas' });
    }
};

// 5. Cancelación de Reserva por el Empleado (NUEVA FUNCIÓN)
exports.cancelMyReservation = async (req, res) => {
    try {
        const reservationId = req.params.id;
        const userId = req.user.id; // ID del usuario logueado haciendo la petición

        const reservation = await Reservation.findById(reservationId);
        
        if (!reservation) {
            return res.status(404).json({ message: 'Reserva no encontrada.' });
        }
        
        // 🚨 VERIFICACIÓN 1: El usuario debe ser el propietario de la reserva 🚨
        if (reservation.user_id !== userId) {
            return res.status(403).json({ message: 'No tienes permiso para cancelar esta reserva.' });
        }

        // 🚨 VERIFICACIÓN 2: Solo se puede cancelar si está pendiente o aprobada 🚨
        if (reservation.status !== 'pending' && reservation.status !== 'approved') {
            return res.status(400).json({ message: `La reserva ya está en estado '${reservation.status}' y no puede cancelarse.` });
        }

        // Si pasa las verificaciones, actualizamos el estado a 'canceled'
        await Reservation.updateStatus(reservationId, 'canceled');

        res.json({ message: 'Reserva cancelada con éxito.' });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error al cancelar la reserva.' });
    }
};