// src/routes/documentRoutes.js
const express = require('express');
const router = express.Router();
const documentController = require('../controllers/documentController');
// RUTA CORREGIDA: Cambiar 'middlewares' (plural) a 'middleware' (singular)
const { verifyToken, isAdmin } = require('../middleware/authMiddleware'); 

// Todas estas rutas requieren autenticación (verifyToken) y rol de administrador (isAdmin)

// [R]EAD: Obtener todos los documentos para un vehículo específico
// GET /api/documents/:vehicleId
router.get('/:vehicleId', verifyToken, isAdmin, documentController.getDocumentsByVehicle);
router.get('/global/all', verifyToken, isAdmin, documentController.getAllDocumentsGlobal);

// [C]REATE: Crear un nuevo registro de documento/mantenimiento
// POST /api/documents
router.post('/', verifyToken, isAdmin, documentController.createDocument);

// [D]ELETE: Eliminar un documento por ID
// DELETE /api/documents/:id
router.delete('/:id', verifyToken, isAdmin, documentController.deleteDocument);


module.exports = router;