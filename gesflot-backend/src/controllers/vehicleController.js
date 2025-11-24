// src/controllers/vehicleController.js
const Vehicle = require('../models/vehicleModel');

// 1. Obtener todos los vehículos (GET /api/vehicles)
exports.getAllVehicles = async (req, res) => {
    try {
        const vehicles = await Vehicle.findAll();
        res.json(vehicles);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error al obtener la lista de vehículos' });
    }
};

// 2. Crear un nuevo vehículo (POST /api/vehicles)
exports.createVehicle = async (req, res) => {
    try {
        // Validación básica de campos obligatorios
        const { make, model, license_plate, mileage } = req.body;
        if (!make || !model || !license_plate) {
            return res.status(400).json({ message: 'Faltan campos obligatorios' });
        }
        
        const newVehicleId = await Vehicle.create(req.body);
        res.status(201).json({ message: 'Vehículo registrado correctamente', id: newVehicleId });
    } catch (error) {
        // En caso de que la matrícula esté duplicada (error de MySQL)
        if (error.code === 'ER_DUP_ENTRY') {
            return res.status(409).json({ message: 'La matrícula ya está registrada' });
        }
        console.error(error);
        res.status(500).json({ message: 'Error al crear el vehículo' });
    }
};

// 3. Obtener un vehículo por ID (GET /api/vehicles/:id)
exports.getVehicleById = async (req, res) => {
    try {
        const vehicle = await Vehicle.findById(req.params.id);
        if (!vehicle) {
            return res.status(404).json({ message: 'Vehículo no encontrado' });
        }
        res.json(vehicle);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error al obtener el vehículo' });
    }
};

// 4. Actualizar un vehículo (PUT /api/vehicles/:id)
exports.updateVehicle = async (req, res) => {
    try {
        const rowsAffected = await Vehicle.update(req.params.id, req.body);
        if (rowsAffected === 0) {
            return res.status(404).json({ message: 'Vehículo no encontrado para actualizar' });
        }
        res.json({ message: 'Vehículo actualizado correctamente' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error al actualizar el vehículo' });
    }
};

// 5. Eliminar un vehículo (DELETE /api/vehicles/:id)
exports.deleteVehicle = async (req, res) => {
    try {
        const rowsAffected = await Vehicle.remove(req.params.id);
        if (rowsAffected === 0) {
            return res.status(404).json({ message: 'Vehículo no encontrado para eliminar' });
        }
        res.json({ message: 'Vehículo eliminado correctamente' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error al eliminar el vehículo' });
    }
};