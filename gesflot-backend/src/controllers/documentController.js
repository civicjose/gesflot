const Document = require('../models/documentModel');

// 1. Ver papeles de un coche
exports.getDocumentsByVehicle = async (req, res) => {
    try {
        const documentos = await Document.findByVehicle(req.params.vehicleId);
        // Si está vacío, devolvemos array vacío en vez de 404 para que el frontend no falle
        if (!documentos) {
             return res.json([]); 
        }
        res.json(documentos);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error al cargar la documentación.' });
    }
};

// 2. Añadir documento o mantenimiento
exports.createDocument = async (req, res) => {
    try {
        const { vehicle_id, document_type } = req.body;
        
        if (!vehicle_id || !document_type) {
            return res.status(400).json({ message: 'Falta el tipo de documento o el vehículo.' });
        }
        
        const nuevoId = await Document.create(req.body);
        res.status(201).json({ message: 'Registro añadido correctamente.', id: nuevoId });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error al guardar el documento.' });
    }
};

// 3. Borrar documento
exports.deleteDocument = async (req, res) => {
    try {
        const filas = await Document.remove(req.params.id);
        if (filas === 0) {
            return res.status(404).json({ message: 'No encuentro ese documento.' });
        }
        res.json({ message: 'Documento borrado.' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error al borrar.' });
    }
};

// 4. Reporte global
exports.getAllDocumentsGlobal = async (req, res) => {
    try {
        const documentos = await Document.findAllGlobal();
        res.json(documentos);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error al generar el reporte global.' });
    }
};