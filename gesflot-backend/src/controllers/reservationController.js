// src/controllers/reservationController.js
const Reservation = require('../models/reservationModel');

// 1. Solicitar nueva reserva
exports.requestReservation = async (req, res) => {
    try {
        const { vehicle_id, start_time, end_time } = req.body;
        const usuarioId = req.user.id;

        // Validación básica de coherencia
        if (new Date(start_time) >= new Date(end_time)) {
            return res.status(400).json({ message: 'La fecha de inicio debe ser antes que la de fin.' });
        }

        // Comprobar disponibilidad
        const estaLibre = await Reservation.checkAvailability(vehicle_id, start_time, end_time);

        if (!estaLibre) {
            const conflicto = await Reservation.findConflict(vehicle_id, start_time, end_time);

            let mensajeError = 'El vehículo ya está ocupado en ese horario.';

            if (conflicto) {
                // Formateamos las fechas a algo legible (ej: 25/11/2025 10:00)
                const inicioOcupado = new Date(conflicto.start_time).toLocaleString('es-ES', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' });
                const finOcupado = new Date(conflicto.end_time).toLocaleString('es-ES', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' });

                mensajeError = `Conflicto: El vehículo ya está reservado desde el ${inicioOcupado} hasta el ${finOcupado}. Por favor, elige otro intervalo.`;
            }

            return res.status(409).json({ message: mensajeError });
        }

        const idReserva = await Reservation.create({ user_id: usuarioId, vehicle_id, start_time, end_time });

        res.status(201).json({
            message: 'Solicitud enviada. Pendiente de aprobación.',
            id: idReserva
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error al pedir la reserva.' });
    }
};

// 2. Obtener todas
exports.getAllReservations = async (req, res) => {
    try {
        const reservas = await Reservation.findAll();
        res.json(reservas);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error al cargar reservas.' });
    }
};

// 3. Cambiar estado
exports.updateReservationStatus = async (req, res) => {
    try {
        const { status } = req.body;

        if (!['approved', 'rejected', 'canceled', 'completed'].includes(status)) {
            return res.status(400).json({ message: 'Estado no válido.' });
        }

        const filas = await Reservation.updateStatus(req.params.id, status);

        if (filas === 0) {
            return res.status(404).json({ message: 'Reserva no encontrada.' });
        }

        res.json({ message: `Estado actualizado a ${status}.` });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error al actualizar estado.' });
    }
};

// 4. Mis reservas
exports.getMyReservations = async (req, res) => {
    try {
        const misReservas = await Reservation.findByUser(req.user.id);
        res.json(misReservas);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error al cargar tus reservas.' });
    }
};

// 5. Cancelar reserva propia
exports.cancelMyReservation = async (req, res) => {
    try {
        const idReserva = req.params.id;
        const usuarioId = req.user.id;

        const reserva = await Reservation.findById(idReserva);

        if (!reserva) {
            return res.status(404).json({ message: 'No existe esa reserva.' });
        }

        if (reserva.user_id !== usuarioId) {
            return res.status(403).json({ message: 'No puedes cancelar reservas de otros.' });
        }

        if (reserva.status !== 'pending' && reserva.status !== 'approved') {
            return res.status(400).json({ message: 'Ya no se puede cancelar.' });
        }

        await Reservation.updateStatus(idReserva, 'canceled');

        res.json({ message: 'Reserva cancelada.' });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error al cancelar.' });
    }
};

// 6. Ver disponibilidad general (Pública para empleados)
exports.getAvailability = async (req, res) => {
    try {
        const disponibilidad = await Reservation.getAvailability();
        res.json(disponibilidad);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error al cargar disponibilidad.' });
    }
};