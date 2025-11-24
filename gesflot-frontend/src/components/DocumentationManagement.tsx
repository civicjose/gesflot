import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FaFileAlt, FaExclamationTriangle, FaCheckCircle } from 'react-icons/fa';

interface GlobalDocument {
    id: number;
    license_plate: string;
    make: string;
    model: string;
    document_type: string;
    expiration_date: string | null;
    maintenance_mileage: number | null;
}

const DocumentationManagement: React.FC = () => {
    const [documents, setDocuments] = useState<GlobalDocument[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchDocs = async () => {
            try {
                const res = await axios.get<GlobalDocument[]>('/api/documents/global/all');
                setDocuments(res.data);
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchDocs();
    }, []);

    // Función para determinar el estado de urgencia
    const getStatusColor = (dateStr: string | null) => {
        if (!dateStr) return 'text-gray-500';
        const days = (new Date(dateStr).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24);
        if (days < 0) return 'text-red-600 font-bold'; // Vencido
        if (days < 30) return 'text-yellow-600 font-bold'; // Próximo
        return 'text-green-600'; // OK
    };

    if (loading) return <p className="text-indigo-600">Cargando reporte de documentación...</p>;

    return (
        <div className="mt-8">
            <h3 className="text-2xl font-semibold mb-6 text-gray-800 flex items-center space-x-2">
                <FaFileAlt className="text-indigo-600" />
                <span>Reporte Global de Documentación y Mantenimientos</span>
            </h3>
            
            <div className="bg-white shadow rounded-lg overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Vehículo</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tipo</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Vencimiento / Km</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Estado</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {documents.map((doc) => (
                            <tr key={doc.id} className="hover:bg-gray-50">
                                <td className="px-6 py-4 whitespace-nowrap font-medium">
                                    {doc.license_plate} <span className="text-gray-500 font-normal">({doc.make} {doc.model})</span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap capitalize">{doc.document_type}</td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    {doc.expiration_date 
                                        ? new Date(doc.expiration_date).toLocaleDateString() 
                                        : `${doc.maintenance_mileage?.toLocaleString()} km`}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    {doc.expiration_date ? (
                                        <span className={`flex items-center space-x-1 ${getStatusColor(doc.expiration_date)}`}>
                                            {getStatusColor(doc.expiration_date).includes('red') ? <FaExclamationTriangle /> : <FaCheckCircle />}
                                            <span>
                                                {getStatusColor(doc.expiration_date).includes('red') ? 'VENCIDO' : 
                                                 getStatusColor(doc.expiration_date).includes('yellow') ? 'PRÓXIMO' : 'VIGENTE'}
                                            </span>
                                        </span>
                                    ) : (
                                        <span className="text-gray-500">Control por Km</span>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                {documents.length === 0 && <p className="p-6 text-center text-gray-500">No hay documentos registrados en la flota.</p>}
            </div>
        </div>
    );
};

export default DocumentationManagement;