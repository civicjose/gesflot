// src/controllers/userController.js
const db = require('../config/db');
const bcrypt = require('bcryptjs'); // Necesario para encriptar la contraseña

// Obtener todos los usuarios
exports.getAllUsers = async (req, res) => {
    try {
        const [users] = await db.query('SELECT id, name, email, role, created_at FROM users ORDER BY created_at DESC');
        res.json(users);
    } catch (error) {
        res.status(500).json({ message: 'Error al obtener usuarios' });
    }
};

// Crear nuevo usuario (Admin)
exports.createUser = async (req, res) => {
    try {
        const { name, email, password, role } = req.body;

        // Validaciones básicas
        if (!name || !email || !password || !role) {
            return res.status(400).json({ message: 'Todos los campos son obligatorios.' });
        }

        // Verificar si el usuario ya existe
        const [existing] = await db.query('SELECT * FROM users WHERE email = ?', [email]);
        if (existing.length > 0) {
            return res.status(400).json({ message: 'El correo electrónico ya está registrado.' });
        }

        // Encriptar contraseña
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Insertar en la BD
        const [result] = await db.query(
            'INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)',
            [name, email, hashedPassword, role]
        );

        res.status(201).json({ message: 'Usuario creado con éxito', id: result.insertId });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error al crear el usuario.' });
    }
};

// Eliminar usuario
exports.deleteUser = async (req, res) => {
    try {
        const { id } = req.params;
        if (parseInt(id) === req.user.id) {
            return res.status(400).json({ message: 'No puedes eliminar tu propia cuenta.' });
        }

        await db.query('DELETE FROM users WHERE id = ?', [id]);
        res.json({ message: 'Usuario eliminado correctamente' });
    } catch (error) {
        res.status(500).json({ message: 'Error al eliminar usuario' });
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
        res.json({ message: 'Rol actualizado correctamente' });
    } catch (error) {
        res.status(500).json({ message: 'Error al actualizar rol' });
    }
};