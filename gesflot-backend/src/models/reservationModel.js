// src/models/reservationModel.js
const db = require('../config/db');

const Reservation = {
    // 1. Verificar disponibilidad y prevenir Overbooking
    checkAvailability: async (vehicle_id, start_time, end_time, exclude_reservation_id = null) => {
        // Esta es la consulta CLAVE para evitar solapamientos.
        // Busca reservas existentes para ese vehículo (vehicle_id)
        // donde los rangos de tiempo se cruzan.
        let query = `
            SELECT COUNT(*) AS count
            FROM reservations
            WHERE vehicle_id = ?
            AND status IN ('pending', 'approved')
            AND NOT (
                end_time <= ? OR start_time >= ?
            )`;

        let params = [vehicle_id, start_time, end_time];

        // Añadir exclusión si estamos editando una reserva existente
        if (exclude_reservation_id) {
            query += ' AND id != ?';
            params.push(exclude_reservation_id);
        }

        const [rows] = await db.query(query, params);
        
        // Si count > 0, significa que hay solapamiento y el vehículo no está disponible
        return rows[0].count === 0;
    },

    // 2. Crear una nueva reserva
    create: async (data) => {
        const { user_id, vehicle_id, start_time, end_time } = data;
        const [result] = await db.query(
            'INSERT INTO reservations (user_id, vehicle_id, start_time, end_time, status) VALUES (?, ?, ?, ?, ?)',
            [user_id, vehicle_id, start_time, end_time, 'pending'] // Siempre empieza como pendiente
        );
        return result.insertId;
    },

    // 3. Obtener todas las reservas (para el calendario del Admin)
    findAll: async () => {
        const [rows] = await db.query(`
            SELECT r.*, v.license_plate, v.make, v.model, u.name AS user_name 
            FROM reservations r
            JOIN vehicles v ON r.vehicle_id = v.id
            JOIN users u ON r.user_id = u.id
            ORDER BY r.start_time DESC
        `);
        return rows;
    },

    // 4. Obtener las reservas de un usuario específico (para el empleado)
    findByUser: async (user_id) => {
        const [rows] = await db.query(`
            SELECT r.*, v.license_plate, v.make, v.model
            FROM reservations r
            JOIN vehicles v ON r.vehicle_id = v.id
            WHERE r.user_id = ?
            ORDER BY r.start_time DESC
        `, [user_id]);
        return rows;
    },

    // 5. Actualizar el estado de una reserva (Aprobar/Rechazar)
    updateStatus: async (id, status) => {
        const [result] = await db.query(
            'UPDATE reservations SET status = ? WHERE id = ?',
            [status, id]
        );
        return result.affectedRows;
    },

    // 6. Obtener una reserva por ID
    findById: async (id) => {
        const [rows] = await db.query('SELECT * FROM reservations WHERE id = ?', [id]);
        return rows[0];
    }
};

module.exports = Reservation;