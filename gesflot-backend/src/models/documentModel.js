const db = require('../config/db');

const Document = {
    create: async (datos) => {
        const { vehicle_id, document_type, expiration_date, maintenance_mileage, details } = datos;
        const [resultado] = await db.query(
            'INSERT INTO documents (vehicle_id, document_type, expiration_date, maintenance_mileage, details) VALUES (?, ?, ?, ?, ?)',
            [vehicle_id, document_type, expiration_date || null, maintenance_mileage || null, details || null]
        );
        return resultado.insertId;
    },

    findByVehicle: async (vehicle_id) => {
        const [filas] = await db.query(`
            SELECT d.*, v.license_plate 
            FROM documents d
            JOIN vehicles v ON d.vehicle_id = v.id
            WHERE d.vehicle_id = ? 
            ORDER BY d.expiration_date DESC
        `, [vehicle_id]);
        return filas;
    },

    findAllGlobal: async () => {
        const [filas] = await db.query(`
            SELECT d.*, v.license_plate, v.make, v.model 
            FROM documents d
            JOIN vehicles v ON d.vehicle_id = v.id
            ORDER BY d.expiration_date ASC
        `);
        return filas;
    },

    remove: async (id) => {
        const [resultado] = await db.query('DELETE FROM documents WHERE id = ?', [id]);
        return resultado.affectedRows;
    }
};

module.exports = Document;