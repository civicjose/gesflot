// src/models/vehicleModel.js
const db = require('../config/db');

const Vehicle = {
    // [C]REATE: Añadir un nuevo vehículo
    create: async (data) => {
        const { make, model, license_plate, mileage, status } = data;
        const [result] = await db.query(
            'INSERT INTO vehicles (make, model, license_plate, mileage, status) VALUES (?, ?, ?, ?, ?)',
            [make, model, license_plate, mileage, status || 'available'] // Estado por defecto
        );
        return result.insertId;
    },

    // [R]EAD: Obtener todos los vehículos
    findAll: async () => {
        const [rows] = await db.query('SELECT * FROM vehicles ORDER BY license_plate ASC');
        return rows;
    },

    // [R]EAD: Obtener un vehículo por ID
    findById: async (id) => {
        const [rows] = await db.query('SELECT * FROM vehicles WHERE id = ?', [id]);
        return rows[0];
    },

    // [U]PDATE: Actualizar datos de un vehículo
    update: async (id, data) => {
        const { make, model, license_plate, mileage, status } = data;
        const [result] = await db.query(
            'UPDATE vehicles SET make = ?, model = ?, license_plate = ?, mileage = ?, status = ? WHERE id = ?',
            [make, model, license_plate, mileage, status, id]
        );
        return result.affectedRows;
    },

    // [D]ELETE: Eliminar un vehículo
    remove: async (id) => {
        const [result] = await db.query('DELETE FROM vehicles WHERE id = ?', [id]);
        return result.affectedRows;
    }
};

module.exports = Vehicle;