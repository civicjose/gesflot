// src/models/documentModel.js
const db = require('../config/db');

const Document = {
    // [C]REATE: Añadir un nuevo documento/mantenimiento a un vehículo
    create: async (data) => {
        const { vehicle_id, document_type, expiration_date, maintenance_mileage, details } = data;
        const [result] = await db.query(
            'INSERT INTO documents (vehicle_id, document_type, expiration_date, maintenance_mileage, details) VALUES (?, ?, ?, ?, ?)',
            [vehicle_id, document_type, expiration_date || null, maintenance_mileage || null, details || null]
        );
        return result.insertId;
    },

    // [R]EAD: Obtener todos los documentos de un vehículo específico
    findByVehicle: async (vehicle_id) => {
        const [rows] = await db.query(`
            SELECT d.*, v.license_plate 
            FROM documents d
            JOIN vehicles v ON d.vehicle_id = v.id
            WHERE d.vehicle_id = ? 
            ORDER BY d.expiration_date DESC
        `, [vehicle_id]);
        return rows;
    },

    // [R]EAD: Obtener TODOS los documentos de la flota (Vista Global Admin)
    findAllGlobal: async () => {
        const [rows] = await db.query(`
            SELECT d.*, v.license_plate, v.make, v.model 
            FROM documents d
            JOIN vehicles v ON d.vehicle_id = v.id
            ORDER BY d.expiration_date ASC
        `);
        return rows;
    },

    // [U]PDATE: Actualizar un documento por ID (Aunque no lo usamos en el frontend aún, es bueno tenerlo)
    update: async (id, data) => {
        const { document_type, expiration_date, maintenance_mileage, details } = data;
        const [result] = await db.query(
            'UPDATE documents SET document_type = ?, expiration_date = ?, maintenance_mileage = ?, details = ? WHERE id = ?',
            [document_type, expiration_date || null, maintenance_mileage || null, details || null, id]
        );
        return result.affectedRows;
    },

    // [D]ELETE: Eliminar un documento
    remove: async (id) => {
        const [result] = await db.query('DELETE FROM documents WHERE id = ?', [id]);
        return result.affectedRows;
    }
};

module.exports = Document;