// src/models/reservationModel.js
const db = require('../config/db');

const Reservation = {
    // 1. Verificar disponibilidad (Devuelve true/false)
    checkAvailability: async (vehicle_id, start_time, end_time, exclude_reservation_id = null) => {
        let query = `
            SELECT COUNT(*) AS count
            FROM reservations
            WHERE vehicle_id = ?
            AND status IN ('pending', 'approved')
            AND NOT (
                end_time <= ? OR start_time >= ?
            )`;

        let params = [vehicle_id, start_time, end_time];

        if (exclude_reservation_id) {
            query += ' AND id != ?';
            params.push(exclude_reservation_id);
        }

        const [rows] = await db.query(query, params);
        return rows[0].count === 0;
    },

    findConflict: async (vehicle_id, start_time, end_time) => {
        // Buscamos la primera reserva que se solape para sacar sus fechas
        const [rows] = await db.query(`
            SELECT start_time, end_time
            FROM reservations
            WHERE vehicle_id = ?
            AND status IN ('pending', 'approved')
            AND NOT (end_time <= ? OR start_time >= ?)
            LIMIT 1
        `, [vehicle_id, start_time, end_time]);
        
        return rows[0]; // Devolvemos la reserva conflictiva si existe
    },

    // 2. Crear una nueva reserva
    create: async (data) => {
        const { user_id, vehicle_id, start_time, end_time } = data;
        const [result] = await db.query(
            'INSERT INTO reservations (user_id, vehicle_id, start_time, end_time, status) VALUES (?, ?, ?, ?, ?)',
            [user_id, vehicle_id, start_time, end_time, 'pending'] 
        );
        return result.insertId;
    },

    // 3. Obtener todas las reservas (Admin)
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

    // 4. Obtener las reservas de un usuario (Empleado)
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

    // 5. Actualizar estado
    updateStatus: async (id, status) => {
        const [result] = await db.query(
            'UPDATE reservations SET status = ? WHERE id = ?',
            [status, id]
        );
        return result.affectedRows;
    },

    // 6. Buscar por ID
    findById: async (id) => {
        const [rows] = await db.query('SELECT * FROM reservations WHERE id = ?', [id]);
        return rows[0];
    },

    // 7. Obtener disponibilidad pública (para el calendario de empleados)
    getAvailability: async () => {
        const [rows] = await db.query(`
            SELECT r.id, r.vehicle_id, r.start_time, r.end_time, r.status, v.make, v.model, v.license_plate
            FROM reservations r
            JOIN vehicles v ON r.vehicle_id = v.id
            WHERE r.status IN ('pending', 'approved')
        `);
        return rows;
    },
};

module.exports = Reservation;