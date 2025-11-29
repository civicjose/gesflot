const db = require('../config/db');

const Vehicle = {
    // Insertar nuevo coche
    create: async (datos) => {
        const { make, model, license_plate, mileage, status } = datos;
        const [resultado] = await db.query(
            'INSERT INTO vehicles (make, model, license_plate, mileage, status) VALUES (?, ?, ?, ?, ?)',
            [make, model, license_plate, mileage, status || 'available'] 
        );
        return resultado.insertId;
    },

    // Listar todos ordenados por matrícula
    findAll: async () => {
        const [filas] = await db.query('SELECT * FROM vehicles ORDER BY license_plate ASC');
        return filas;
    },

    // Buscar uno concreto
    findById: async (id) => {
        const [filas] = await db.query('SELECT * FROM vehicles WHERE id = ?', [id]);
        return filas[0];
    },

    // Modificar
    update: async (id, datos) => {
        const { make, model, license_plate, mileage, status } = datos;
        const [resultado] = await db.query(
            'UPDATE vehicles SET make = ?, model = ?, license_plate = ?, mileage = ?, status = ? WHERE id = ?',
            [make, model, license_plate, mileage, status, id]
        );
        return resultado.affectedRows;
    },

    // Eliminar
    remove: async (id) => {
        const [resultado] = await db.query('DELETE FROM vehicles WHERE id = ?', [id]);
        return resultado.affectedRows;
    }
};

module.exports = Vehicle;