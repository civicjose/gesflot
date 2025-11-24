// src/models/userModel.js
const db = require('../config/db');

const User = {
    findByEmail: async (email) => {
        const [rows] = await db.query('SELECT * FROM users WHERE email = ?', [email]);
        return rows[0];
    },

    // Crear nuevo usuario
    create: async (userData) => {
        const { name, email, password, role } = userData;
        const [result] = await db.query(
            'INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)',
            [name, email, password, role || 'employee']
        );
        return result.insertId;
    }
};

module.exports = User;