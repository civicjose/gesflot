const db = require('../config/db');

const User = {
    findByEmail: async (email) => {
        const [filas] = await db.query('SELECT * FROM users WHERE email = ?', [email]);
        return filas[0];
    },

    // Registro de usuario
    create: async (datosUsuario) => {
        const { name, email, password, role } = datosUsuario;
        const [resultado] = await db.query(
            'INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)',
            [name, email, password, role || 'employee']
        );
        return resultado.insertId;
    }
};

module.exports = User;