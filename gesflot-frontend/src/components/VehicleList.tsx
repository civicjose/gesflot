import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { FaTrash, FaEdit, FaCar, FaPlus, FaBook } from 'react-icons/fa'; 
import VehicleFormModal from './VehicleFormModal'; 
import DocumentModal from './DocumentModal';

// Defino cómo es un coche
interface Vehiculo {
    id: number;
    make: string;
    model: string;
    license_plate: string;
    mileage: number;
    status: 'available' | 'in_use' | 'maintenance';
}

const VehicleList: React.FC = () => {
    const [vehiculos, setVehiculos] = useState<Vehiculo[]>([]);
    const [cargando, setCargando] = useState(true);
    const [error, setError] = useState('');
    
    // Estados para los modales
    const [modalAbierto, setModalAbierto] = useState(false);
    const [modalDocsAbierto, setModalDocsAbierto] = useState(false);
    
    const [cocheEditando, setCocheEditando] = useState<Vehiculo | null>(null);
    const [cocheSeleccionado, setCocheSeleccionado] = useState<Vehiculo | null>(null);
    
    const { logout } = useAuth();

    // Abrir modal para editar o crear
    const abrirModalEdicion = (coche: Vehiculo | null) => {
        setCocheEditando(coche);
        setModalAbierto(true);
    };

    // Abrir modal de papeles
    const verDocumentacion = (coche: Vehiculo) => {
        setCocheSeleccionado(coche);
        setModalDocsAbierto(true);
    };

    const cargarVehiculos = useCallback(async () => {
        setCargando(true);
        setError('');
        try {
            const respuesta = await axios.get<Vehiculo[]>('/api/vehicles');
            setVehiculos(respuesta.data);
        } catch (err: any) {
            if (err.response && (err.response.status === 403 || err.response.status === 401)) {
                setError('No tienes permiso para ver esto.');
                logout(); 
            } else {
                setError('Falló la conexión con el servidor.');
            }
        } finally {
            setCargando(false);
        }
    }, [logout]);

    const borrarVehiculo = async (id: number) => {
        if (!window.confirm('¿Seguro que quieres borrar este coche? Se borrará todo su historial.')) {
            return;
        }

        try {
            await axios.delete(`/api/vehicles/${id}`);
            cargarVehiculos(); 
        } catch (err: any) {
            setError('No se pudo borrar. Puede que tenga reservas activas.');
        }
    };

    useEffect(() => {
        cargarVehiculos();
    }, [cargarVehiculos]); 

    if (cargando) return <p className="text-indigo-600">Cargando flota...</p>;
    if (error) return <p className="text-red-500 font-semibold">{error}</p>;

    return (
        <div className="mt-8">
            <VehicleFormModal 
                isOpen={modalAbierto} 
                onClose={() => { setModalAbierto(false); setCocheEditando(null); }}
                onSuccess={cargarVehiculos} 
                initialData={cocheEditando} 
            />

            {cocheSeleccionado && (
                 <DocumentModal 
                    isOpen={modalDocsAbierto} 
                    onClose={() => { setModalDocsAbierto(false); setCocheSeleccionado(null); }}
                    vehicle={cocheSeleccionado}
                />
            )}
            
            <h3 className="text-2xl font-semibold mb-4 flex items-center space-x-2 text-gray-800">
                <FaCar className="text-indigo-600" />
                <span>Gestión de flota ({vehiculos.length} vehículos)</span>
            </h3>
            
            <div className="mb-4 flex justify-end">
                <button 
                    onClick={() => abrirModalEdicion(null)}
                    className="flex items-center space-x-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded transition duration-150 shadow"
                >
                    <FaPlus />
                    <span>Añadir vehículo</span>
                </button>
            </div>
            
            <div className="bg-white shadow rounded-lg overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Matrícula</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Modelo</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Kilómetros</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Estado</th>
                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Acciones</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {vehiculos.map((v) => (
                            <tr key={v.id} className="hover:bg-indigo-50 transition duration-100">
                                <td className="px-6 py-4 whitespace-nowrap font-medium text-indigo-700">{v.license_plate}</td>
                                <td className="px-6 py-4 whitespace-nowrap">{v.make} {v.model}</td>
                                <td className="px-6 py-4 whitespace-nowrap">{v.mileage.toLocaleString()} km</td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                        v.status === 'available' ? 'bg-green-100 text-green-800' :
                                        v.status === 'in_use' ? 'bg-yellow-100 text-yellow-800' :
                                        'bg-red-100 text-red-800'
                                    }`}>
                                        {v.status === 'available' ? 'Disponible' : v.status === 'in_use' ? 'En uso' : 'Taller'}
                                    </span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                                    <button onClick={() => verDocumentacion(v)} title="Ver papeles" className="text-gray-600 hover:text-indigo-800 p-2 rounded-full hover:bg-gray-100">
                                        <FaBook />
                                    </button>
                                    <button onClick={() => abrirModalEdicion(v)} title="Editar" className="text-indigo-600 hover:text-indigo-800 p-2 rounded-full hover:bg-gray-100">
                                        <FaEdit />
                                    </button>
                                    <button onClick={() => borrarVehiculo(v.id)} title="Borrar" className="text-red-600 hover:text-red-800 p-2 rounded-full hover:bg-gray-100">
                                        <FaTrash />
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default VehicleList;