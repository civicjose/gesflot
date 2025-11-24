import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { FaTimes, FaSave, FaTrash, FaBook } from 'react-icons/fa';

// Tipos de datos
interface Document {
    id: number;
    vehicle_id: number;
    document_type: 'itv' | 'insurance' | 'maintenance';
    expiration_date: string | null; // Usaremos string para las fechas ISO
    maintenance_mileage: number | null;
    details: string | null;
}

interface Vehicle {
    id: number;
    license_plate: string;
}

interface DocumentModalProps {
    isOpen: boolean;
    onClose: () => void;
    vehicle: Vehicle; // El vehículo al que pertenece la documentación
}

const DocumentModal: React.FC<DocumentModalProps> = ({ isOpen, onClose, vehicle }) => {
    const [documents, setDocuments] = useState<Document[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [newDocForm, setNewDocForm] = useState({
        document_type: 'itv' as 'itv' | 'insurance' | 'maintenance',
        expiration_date: '',
        maintenance_mileage: 0,
        details: '',
    });

    // R: Obtener la documentación asociada al vehículo
    const fetchDocuments = useCallback(async () => {
        setLoading(true);
        setError('');
        try {
            // Llama a la ruta GET /api/documents/:vehicleId que creamos en el backend
            const response = await axios.get<Document[]>(`/api/documents/${vehicle.id}`);
            setDocuments(response.data);
        } catch (err: any) {
            // Si devuelve 404, asumimos que no hay documentos aún, no es un error fatal.
            if (err.response?.status !== 404) {
                 setError('Error al cargar la documentación.');
            } else {
                 setDocuments([]); // Si no hay documentos, la lista está vacía
            }
        } finally {
            setLoading(false);
        }
    }, [vehicle.id]);

    // D: Eliminar Documento
    const handleDelete = async (docId: number) => {
        if (!window.confirm('¿Eliminar este registro de documento/mantenimiento?')) return;
        try {
            await axios.delete(`/api/documents/${docId}`);
            fetchDocuments(); // Recargar la lista
        } catch (err) {
            setError('Error al eliminar el registro.');
        }
    };

    // C: Crear Documento/Mantenimiento
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        const dataToSend = {
            vehicle_id: vehicle.id,
            ...newDocForm,
            // Limpiar campos que no aplican según el tipo de documento
            expiration_date: (newDocForm.document_type === 'itv' || newDocForm.document_type === 'insurance') ? newDocForm.expiration_date : null,
            maintenance_mileage: newDocForm.document_type === 'maintenance' ? newDocForm.maintenance_mileage : null,
        };

        try {
            await axios.post('/api/documents', dataToSend);
            fetchDocuments(); // Recargar la lista
            setNewDocForm({ document_type: 'itv', expiration_date: '', maintenance_mileage: 0, details: '' }); // Resetear
        } catch (err: any) {
            setError(err.response?.data?.message || 'Error al guardar el nuevo registro.');
        }
    };

    useEffect(() => {
        if (isOpen) {
            fetchDocuments();
        }
    }, [isOpen, fetchDocuments]);

    if (!isOpen) return null;

    // Lógica para mostrar campos según el tipo de documento
    const showExpirationDate = newDocForm.document_type === 'itv' || newDocForm.document_type === 'insurance';
    const showMileage = newDocForm.document_type === 'maintenance';

    return (
        <div className="fixed inset-0 bg-gray-900 bg-opacity-75 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
                
                {/* Cabecera */}
                <div className="flex justify-between items-center p-6 border-b border-gray-200 bg-indigo-700 rounded-t-xl">
                    <h3 className="text-xl font-bold text-white flex items-center space-x-2">
                        <FaBook />
                        <span>Documentación de {vehicle.license_plate}</span>
                    </h3>
                    <button onClick={onClose} className="text-white hover:text-indigo-200 transition">
                        <FaTimes size={20} />
                    </button>
                </div>

                {/* Cuerpo del Modal */}
                <div className="p-6">
                    {/* Sección 1: Crear Nuevo Registro */}
                    <h4 className="text-lg font-semibold text-gray-800 mb-3 border-b pb-1">Nuevo Registro</h4>
                    <form onSubmit={handleSubmit} className="grid grid-cols-6 gap-3 mb-6 p-4 bg-indigo-50 rounded-lg">
                        
                        {/* Tipo de Documento */}
                        <div className="col-span-2">
                            <label className="block text-sm font-medium text-gray-700 mb-1">Tipo</label>
                            <select name="document_type" value={newDocForm.document_type} onChange={(e) => setNewDocForm(prev => ({ ...prev, document_type: e.target.value as any }))} required
                                className="w-full p-2 border border-gray-300 rounded-lg bg-white">
                                <option value="itv">ITV</option>
                                <option value="insurance">Seguro</option>
                                <option value="maintenance">Mantenimiento (Km)</option>
                            </select>
                        </div>

                        {/* Fecha de Expiración (Condicional) */}
                        {showExpirationDate && (
                            <div className="col-span-2">
                                <label className="block text-sm font-medium text-gray-700 mb-1">Fecha de Expiración</label>
                                <input type="date" name="expiration_date" value={newDocForm.expiration_date} onChange={(e) => setNewDocForm(prev => ({ ...prev, expiration_date: e.target.value }))} required={showExpirationDate}
                                    className="w-full p-2 border border-gray-300 rounded-lg" />
                            </div>
                        )}

                        {/* Kilometraje de Mantenimiento (Condicional) */}
                        {showMileage && (
                            <div className="col-span-2">
                                <label className="block text-sm font-medium text-gray-700 mb-1">Próximo Mantenimiento (Km)</label>
                                <input type="number" name="maintenance_mileage" value={newDocForm.maintenance_mileage || ''} onChange={(e) => setNewDocForm(prev => ({ ...prev, maintenance_mileage: Number(e.target.value) }))} required={showMileage}
                                    className="w-full p-2 border border-gray-300 rounded-lg" />
                            </div>
                        )}
                        
                        {/* Detalles */}
                        <div className={`col-span-${!showExpirationDate && !showMileage ? 4 : 2}`}>
                             <label className="block text-sm font-medium text-gray-700 mb-1">Detalles</label>
                            <input type="text" name="details" value={newDocForm.details} onChange={(e) => setNewDocForm(prev => ({ ...prev, details: e.target.value }))}
                                className="w-full p-2 border border-gray-300 rounded-lg" />
                        </div>

                        {/* Botón Guardar */}
                        <div className="col-span-6 flex justify-end">
                            <button type="submit" className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 transition duration-150">
                                <FaSave />
                                <span>Añadir Registro</span>
                            </button>
                        </div>
                    </form>
                    {error && <p className="text-red-500 text-sm mb-4">{error}</p>}


                    {/* Sección 2: Historial de Documentos */}
                    <h4 className="text-lg font-semibold text-gray-800 mb-3 border-b pb-1">Historial Existente</h4>
                    
                    {loading ? (<p>Cargando historial...</p>) : documents.length === 0 ? (
                        <p className="text-gray-500 italic">No hay registros de documentos ni mantenimientos para esta matrícula.</p>
                    ) : (
                        <div className="space-y-3">
                            {documents.map(doc => (
                                <div key={doc.id} className="p-4 border rounded-lg flex justify-between items-center bg-white shadow-sm">
                                    <div className="flex-1">
                                        <p className="font-bold text-indigo-700 capitalize">{doc.document_type}</p>
                                        {(doc.expiration_date || doc.maintenance_mileage) && (
                                            <p className="text-sm text-gray-600">
                                                {doc.expiration_date ? 
                                                    `Vence: ${new Date(doc.expiration_date).toLocaleDateString()}` : 
                                                    `Próximo Km: ${doc.maintenance_mileage?.toLocaleString()} km`}
                                            </p>
                                        )}
                                        {doc.details && <p className="text-xs text-gray-500 italic">Detalles: {doc.details}</p>}
                                    </div>
                                    <button onClick={() => handleDelete(doc.id)} className="text-red-600 hover:text-red-800 p-2 transition">
                                        <FaTrash />
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default DocumentModal;