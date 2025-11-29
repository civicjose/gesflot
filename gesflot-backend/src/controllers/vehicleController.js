const Vehicle = require('../models/vehicleModel');

// 1. Obtener todos los vehículos
exports.getAllVehicles = async (req, res) => {
    try {
        const vehiculos = await Vehicle.findAll();
        res.json(vehiculos);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'No se pudo cargar la lista de vehículos.' });
    }
};

// 2. Crear un nuevo vehículo
exports.createVehicle = async (req, res) => {
    try {
        const { make, model, license_plate, mileage } = req.body;
        
        // Comprobar que me mandan los datos importantes
        if (!make || !model || !license_plate) {
            return res.status(400).json({ message: 'Faltan datos obligatorios (marca, modelo o matrícula).' });
        }
        
        const nuevoId = await Vehicle.create(req.body);
        res.status(201).json({ message: 'Vehículo guardado correctamente.', id: nuevoId });

    } catch (error) {
        // Si la matrícula ya existe, MySQL da este error
        if (error.code === 'ER_DUP_ENTRY') {
            return res.status(409).json({ message: 'Esa matrícula ya está registrada.' });
        }
        console.error(error);
        res.status(500).json({ message: 'Error al guardar el vehículo.' });
    }
};

// 3. Buscar por ID
exports.getVehicleById = async (req, res) => {
    try {
        const vehiculo = await Vehicle.findById(req.params.id);
        if (!vehiculo) {
            return res.status(404).json({ message: 'No encuentro ese vehículo.' });
        }
        res.json(vehiculo);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error al buscar el vehículo.' });
    }
};

// 4. Actualizar datos
exports.updateVehicle = async (req, res) => {
    try {
        const filasAfectadas = await Vehicle.update(req.params.id, req.body);
        if (filasAfectadas === 0) {
            return res.status(404).json({ message: 'No se pudo actualizar (quizás no existe).' });
        }
        res.json({ message: 'Datos del vehículo actualizados.' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error al actualizar.' });
    }
};

// 5. Eliminar vehículo
exports.deleteVehicle = async (req, res) => {
    try {
        const filasAfectadas = await Vehicle.remove(req.params.id);
        if (filasAfectadas === 0) {
            return res.status(404).json({ message: 'No encuentro el vehículo para borrarlo.' });
        }
        res.json({ message: 'Vehículo eliminado correctamente.' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error al borrar. ¿Tiene reservas activas?' });
    }
};