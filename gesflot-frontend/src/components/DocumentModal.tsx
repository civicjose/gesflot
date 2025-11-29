import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { FaTimes, FaSave, FaTrash, FaBook } from 'react-icons/fa';

// Defino los tipos aquí para que TS no se queje
interface Documento {
    id: number;
    vehicle_id: number;
    document_type: 'itv' | 'insurance' | 'maintenance';
    expiration_date: string | null;
    maintenance_mileage: number | null;
    details: string | null;
}

interface Vehiculo {
    id: number;
    license_plate: string;
}

interface ModalProps {
    isOpen: boolean;
    onClose: () => void;
    vehicle: Vehiculo; 
}

const DocumentModal: React.FC<ModalProps> = ({ isOpen, onClose, vehicle }) => {
    const [documentos, setDocumentos] = useState<Documento[]>([]);
    const [cargando, setCargando] = useState(true);
    const [error, setError] = useState('');
    
    // En lugar de 'as const', definimos el tipo del estado explícitamente
    const [nuevoDoc, setNuevoDoc] = useState<{
        document_type: 'itv' | 'insurance' | 'maintenance';
        expiration_date: string;
        maintenance_mileage: number;
        details: string;
    }>({
        document_type: 'itv', // Valor inicial
        expiration_date: '',
        maintenance_mileage: 0,
        details: '',
    });

    const cargarDocumentos = useCallback(async () => {
        setCargando(true);
        setError('');
        try {
            const res = await axios.get<Documento[]>(`/api/documents/${vehicle.id}`);
            setDocumentos(res.data);
        } catch (err: any) {
             setDocumentos([]); 
        } finally {
            setCargando(false);
        }
    }, [vehicle.id]);

    const borrarDoc = async (id: number) => {
        if (!window.confirm('¿Borrar este registro?')) return;
        try {
            await axios.delete(`/api/documents/${id}`);
            cargarDocumentos();
        } catch (err) {
            setError('Error al borrar.');
        }
    };

    const enviarForm = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        const datosEnviar = {
            vehicle_id: vehicle.id,
            ...nuevoDoc,
            // Lógica: Si es mantenimiento, ignoro la fecha. Si es ITV/Seguro, ignoro los km.
            expiration_date: (nuevoDoc.document_type === 'itv' || nuevoDoc.document_type === 'insurance') ? nuevoDoc.expiration_date : null,
            maintenance_mileage: nuevoDoc.document_type === 'maintenance' ? nuevoDoc.maintenance_mileage : null,
        };

        try {
            await axios.post('/api/documents', datosEnviar);
            cargarDocumentos(); 
            // Reseteo el formulario
            setNuevoDoc({ document_type: 'itv', expiration_date: '', maintenance_mileage: 0, details: '' }); 
        } catch (err: any) {
            setError('Error al guardar.');
        }
    };

    useEffect(() => {
        if (isOpen) cargarDocumentos();
    }, [isOpen, cargarDocumentos]);

    if (!isOpen) return null;

    // Ahora TS sabe que document_type puede cambiar, así que estas comparaciones ya no dan error
    const pideFecha = nuevoDoc.document_type === 'itv' || nuevoDoc.document_type === 'insurance';
    const pideKm = nuevoDoc.document_type === 'maintenance';

    return (
        <div className="fixed inset-0 bg-gray-900 bg-opacity-75 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
                
                <div className="flex justify-between items-center p-6 border-b border-gray-200 bg-indigo-700 rounded-t-xl">
                    <h3 className="text-xl font-bold text-white flex items-center space-x-2">
                        <FaBook />
                        <span>Documentación - Matrícula: {vehicle.license_plate}</span>
                    </h3>
                    <button onClick={onClose} className="text-white hover:text-indigo-200 transition">
                        <FaTimes size={20} />
                    </button>
                </div>

                <div className="p-6">
                    {/* Formulario de alta */}
                    <h4 className="text-lg font-semibold text-gray-800 mb-3 border-b pb-1">Añadir nuevo</h4>
                    <form onSubmit={enviarForm} className="grid grid-cols-1 md:grid-cols-6 gap-3 mb-6 p-4 bg-indigo-50 rounded-lg">
                        
                        <div className="col-span-2">
                            <label className="block text-sm font-medium text-gray-700 mb-1">Tipo de documento</label>
                            <select 
                                value={nuevoDoc.document_type} 
                                // El casting 'as any' aquí es un truco rápido, pero lo correcto es tipar el evento
                                onChange={(e) => setNuevoDoc(prev => ({ ...prev, document_type: e.target.value as any }))}
                                className="w-full p-2 border border-gray-300 rounded-lg bg-white"
                            >
                                <option value="itv">ITV</option>
                                <option value="insurance">Seguro</option>
                                <option value="maintenance">Mantenimiento</option>
                            </select>
                        </div>

                        {pideFecha && (
                            <div className="col-span-2">
                                <label className="block text-sm font-medium text-gray-700 mb-1">Fecha caducidad</label>
                                <input type="date" value={nuevoDoc.expiration_date} onChange={(e) => setNuevoDoc(prev => ({ ...prev, expiration_date: e.target.value }))} required
                                    className="w-full p-2 border border-gray-300 rounded-lg" />
                            </div>
                        )}

                        {pideKm && (
                            <div className="col-span-2">
                                <label className="block text-sm font-medium text-gray-700 mb-1">Km para revisión</label>
                                <input type="number" value={nuevoDoc.maintenance_mileage || ''} onChange={(e) => setNuevoDoc(prev => ({ ...prev, maintenance_mileage: Number(e.target.value) }))} required
                                    className="w-full p-2 border border-gray-300 rounded-lg" />
                            </div>
                        )}
                        
                        <div className={`col-span-${!pideFecha && !pideKm ? 4 : 2}`}>
                             <label className="block text-sm font-medium text-gray-700 mb-1">Notas</label>
                            <input type="text" value={nuevoDoc.details} onChange={(e) => setNuevoDoc(prev => ({ ...prev, details: e.target.value }))}
                                className="w-full p-2 border border-gray-300 rounded-lg" />
                        </div>

                        <div className="col-span-6 flex justify-end">
                            <button type="submit" className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 transition">
                                <FaSave />
                                <span>Guardar</span>
                            </button>
                        </div>
                    </form>
                    {error && <p className="text-red-500 text-sm mb-4">{error}</p>}

                    {/* Listado */}
                    <h4 className="text-lg font-semibold text-gray-800 mb-3 border-b pb-1">Historial</h4>
                    
                    {cargando ? (<p>Cargando datos...</p>) : documentos.length === 0 ? (
                        <p className="text-gray-500 italic">Este vehículo no tiene documentos registrados.</p>
                    ) : (
                        <div className="space-y-3">
                            {documentos.map(doc => (
                                <div key={doc.id} className="p-4 border rounded-lg flex justify-between items-center bg-white shadow-sm hover:shadow-md transition">
                                    <div className="flex-1">
                                        <p className="font-bold text-indigo-700 capitalize">
                                            {doc.document_type === 'insurance' ? 'Seguro' : doc.document_type === 'maintenance' ? 'Mantenimiento' : 'ITV'}
                                        </p>
                                        {(doc.expiration_date || doc.maintenance_mileage) && (
                                            <p className="text-sm text-gray-600">
                                                {doc.expiration_date ? 
                                                    `Vence el: ${new Date(doc.expiration_date).toLocaleDateString()}` : 
                                                    `Revisión a los: ${doc.maintenance_mileage?.toLocaleString()} km`}
                                            </p>
                                        )}
                                        {doc.details && <p className="text-xs text-gray-500 italic">Nota: {doc.details}</p>}
                                    </div>
                                    <button onClick={() => borrarDoc(doc.id)} className="text-red-600 hover:text-red-800 p-2 transition rounded-full hover:bg-red-50">
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