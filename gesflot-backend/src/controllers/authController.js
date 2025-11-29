// src/controllers/authController.js
const User = require('../models/userModel');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

exports.register = async (req, res) => {
    try {
        const { name, email, password, role } = req.body;

        // Comprobamos si ya existe alguien con ese email
        const usuarioExistente = await User.findByEmail(email);
        if (usuarioExistente) {
            return res.status(400).json({ message: 'Ese correo ya está registrado.' });
        }

        // Encriptamos la contraseña para seguridad
        const salt = await bcrypt.genSalt(10);
        const passwordEncriptada = await bcrypt.hash(password, salt);

        const nuevoId = await User.create({ 
            name, 
            email, 
            password: passwordEncriptada, 
            role 
        });

        res.status(201).json({ message: 'Usuario registrado correctamente', userId: nuevoId });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Hubo un error en el servidor al registrar.' });
    }
};

exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;

        // Buscamos al usuario
        const usuario = await User.findByEmail(email);
        if (!usuario) {
            return res.status(400).json({ message: 'Email o contraseña incorrectos.' });
        }

        // Comparamos las contraseñas
        const coincide = await bcrypt.compare(password, usuario.password);
        if (!coincide) {
            return res.status(400).json({ message: 'Email o contraseña incorrectos.' });
        }

        // Generamos el token para que pueda navegar
        const token = jwt.sign(
            { id: usuario.id, role: usuario.role }, 
            process.env.JWT_SECRET, 
            { expiresIn: '1d' }
        );

        res.json({ 
            message: 'Has entrado correctamente', 
            token, 
            user: { id: usuario.id, name: usuario.name, role: usuario.role } 
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error del servidor al intentar entrar.' });
    }
};