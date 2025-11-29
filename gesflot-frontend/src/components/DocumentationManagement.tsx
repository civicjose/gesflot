import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FaFileAlt, FaExclamationTriangle, FaCheckCircle } from 'react-icons/fa';

interface DocumentoGlobal {
    id: number;
    license_plate: string;
    make: string;
    model: string;
    document_type: string;
    expiration_date: string | null;
    maintenance_mileage: number | null;
}

const DocumentationManagement: React.FC = () => {
    const [documentos, setDocumentos] = useState<DocumentoGlobal[]>([]);
    const [cargando, setCargando] = useState(true);

    useEffect(() => {
        const cargarReporte = async () => {
            try {
                const res = await axios.get<DocumentoGlobal[]>('/api/documents/global/all');
                setDocumentos(res.data);
            } catch (err) {
                console.error(err);
            } finally {
                setCargando(false);
            }
        };
        cargarReporte();
    }, []);

    // Calcula si es urgente (menos de 30 días)
    const getColorEstado = (fechaStr: string | null) => {
        if (!fechaStr) return 'text-gray-500';
        const dias = (new Date(fechaStr).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24);
        if (dias < 0) return 'text-red-600 font-bold'; // Caducado
        if (dias < 30) return 'text-yellow-600 font-bold'; // Cuidado
        return 'text-green-600'; 
    };

    if (cargando) return <p className="text-indigo-600">Generando reporte...</p>;

    return (
        <div className="mt-8">
            <h3 className="text-2xl font-semibold mb-6 text-gray-800 flex items-center space-x-2">
                <FaFileAlt className="text-indigo-600" />
                <span>Estado general de documentación</span>
            </h3>
            
            <div className="bg-white shadow rounded-lg overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Vehículo</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Documento</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Vence / Km</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Alerta</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {documentos.map((doc) => (
                            <tr key={doc.id} className="hover:bg-gray-50">
                                <td className="px-6 py-4 whitespace-nowrap font-medium">
                                    {doc.license_plate} <span className="text-gray-500 font-normal">({doc.make} {doc.model})</span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap capitalize">
                                    {doc.document_type === 'insurance' ? 'Seguro' : doc.document_type}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    {doc.expiration_date 
                                        ? new Date(doc.expiration_date).toLocaleDateString() 
                                        : `${doc.maintenance_mileage?.toLocaleString()} km`}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    {doc.expiration_date ? (
                                        <span className={`flex items-center space-x-1 ${getColorEstado(doc.expiration_date)}`}>
                                            {getColorEstado(doc.expiration_date).includes('red') ? <FaExclamationTriangle /> : <FaCheckCircle />}
                                            <span>
                                                {getColorEstado(doc.expiration_date).includes('red') ? 'CADUCADO' : 
                                                 getColorEstado(doc.expiration_date).includes('yellow') ? 'PRÓXIMO' : 'OK'}
                                            </span>
                                        </span>
                                    ) : (
                                        <span className="text-gray-500">Revisión manual</span>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                {documentos.length === 0 && <p className="p-6 text-center text-gray-500">Todo en orden (o no hay datos).</p>}
            </div>
        </div>
    );
};

export default DocumentationManagement;