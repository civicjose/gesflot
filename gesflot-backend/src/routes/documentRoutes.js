const express = require('express');
const router = express.Router();
const documentController = require('../controllers/documentController');
const { verifyToken, isAdmin } = require('../middleware/authMiddleware'); 

// Todo lo de documentos es solo para Admin por seguridad
router.get('/:vehicleId', verifyToken, isAdmin, documentController.getDocumentsByVehicle);
router.get('/global/all', verifyToken, isAdmin, documentController.getAllDocumentsGlobal);
router.post('/', verifyToken, isAdmin, documentController.createDocument);
router.delete('/:id', verifyToken, isAdmin, documentController.deleteDocument);

module.exports = router;