// src/controllers/documentController.js
const Document = require('../models/documentModel');

// 1. Obtener la documentación de un vehículo (GET /api/documents/:vehicleId)
exports.getDocumentsByVehicle = async (req, res) => {
    try {
        const documents = await Document.findByVehicle(req.params.vehicleId);
        if (documents.length === 0) {
             // Si no hay documentos, devolvemos 404. El frontend lo interpreta como "lista vacía".
             return res.status(404).json({ message: 'Documentación no encontrada para este vehículo' });
        }
        res.json(documents);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error al obtener documentación' });
    }
};

// 2. Crear un nuevo registro de documento/mantenimiento (POST /api/documents)
exports.createDocument = async (req, res) => {
    try {
        const { vehicle_id, document_type } = req.body;
        
        if (!vehicle_id || !document_type) {
            return res.status(400).json({ message: 'Faltan campos obligatorios: vehicle_id y document_type' });
        }
        
        const newDocId = await Document.create(req.body);
        res.status(201).json({ message: 'Documento registrado correctamente', id: newDocId });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error al crear el documento' });
    }
};

// 3. Eliminar un documento (DELETE /api/documents/:id)
exports.deleteDocument = async (req, res) => {
    try {
        const rowsAffected = await Document.remove(req.params.id);
        if (rowsAffected === 0) {
            return res.status(404).json({ message: 'Documento no encontrado para eliminar' });
        }
        res.json({ message: 'Documento eliminado correctamente' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error al eliminar el documento' });
    }
};

exports.getAllDocumentsGlobal = async (req, res) => {
    try {
        const documents = await Document.findAllGlobal();
        res.json(documents);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error al obtener el reporte global de documentos' });
    }
};