const db = require('../config/db');
const bcrypt = require('bcryptjs'); 

// Ver todos los usuarios
exports.getAllUsers = async (req, res) => {
    try {
        const [usuarios] = await db.query('SELECT id, name, email, role, created_at FROM users ORDER BY created_at DESC');
        res.json(usuarios);
    } catch (error) {
        res.status(500).json({ message: 'Error al cargar usuarios.' });
    }
};

// Crear usuario (desde el panel de admin)
exports.createUser = async (req, res) => {
    try {
        const { name, email, password, role } = req.body;

        if (!name || !email || !password || !role) {
            return res.status(400).json({ message: 'Rellena todos los campos.' });
        }

        // Miro si el email ya existe
        const [existente] = await db.query('SELECT * FROM users WHERE email = ?', [email]);
        if (existente.length > 0) {
            return res.status(400).json({ message: 'Ese email ya está en uso.' });
        }

        // Encripto la contraseña
        const salt = await bcrypt.genSalt(10);
        const passEncriptada = await bcrypt.hash(password, salt);

        const [resultado] = await db.query(
            'INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)',
            [name, email, passEncriptada, role]
        );

        res.status(201).json({ message: 'Usuario creado con éxito.', id: resultado.insertId });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error al crear usuario.' });
    }
};

// Eliminar usuario
exports.deleteUser = async (req, res) => {
    try {
        const { id } = req.params;
        // Evitar que el admin se borre a sí mismo
        if (parseInt(id) === req.user.id) {
            return res.status(400).json({ message: 'No puedes borrar tu propia cuenta.' });
        }

        await db.query('DELETE FROM users WHERE id = ?', [id]);
        res.json({ message: 'Usuario eliminado.' });
    } catch (error) {
        res.status(500).json({ message: 'Error al eliminar.' });
    }
};

// Cambiar rol
exports.updateUserRole = async (req, res) => {
    try {
        const { id } = req.params;
        const { role } = req.body;

        if (parseInt(id) === req.user.id) {
             return res.status(400).json({ message: 'No puedes cambiar tu propio rol.' });
        }

        await db.query('UPDATE users SET role = ? WHERE id = ?', [role, id]);
        res.json({ message: 'Permisos actualizados.' });
    } catch (error) {
        res.status(500).json({ message: 'Error al cambiar el rol.' });
    }
};