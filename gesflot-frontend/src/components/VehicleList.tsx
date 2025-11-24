import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { FaTrash, FaEdit, FaCar, FaPlus, FaBook } from 'react-icons/fa'; 
import VehicleFormModal from './VehicleFormModal'; 
import DocumentModal from './DocumentModal'; // <-- ¡NUEVA IMPORTACIÓN!

// --- Tipos de Datos (Interfaces) ---
interface Vehicle {
    id: number;
    make: string;
    model: string;
    license_plate: string;
    mileage: number;
    status: 'available' | 'in_use' | 'maintenance';
}

const VehicleList: React.FC = () => {
    const [vehicles, setVehicles] = useState<Vehicle[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isDocModalOpen, setIsDocModalOpen] = useState(false); // <-- NUEVO: Estado del Modal de Documentación
    const [editingVehicle, setEditingVehicle] = useState<Vehicle | null>(null);
    const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null); // <-- NUEVO: Vehículo seleccionado para Docs
    const { logout } = useAuth();

    const API_BASE_URL = '/api/vehicles'; 

    // Función que abre el modal en modo edición/creación
    const handleEdit = (vehicle: Vehicle | null) => {
        setEditingVehicle(vehicle);
        setIsModalOpen(true);
    };

    // Función para abrir el modal de documentación
    const handleViewDocs = (vehicle: Vehicle) => {
        setSelectedVehicle(vehicle);
        setIsDocModalOpen(true);
    };

    // Función que cierra el modal y resetea el estado de edición
    const handleCloseModal = () => {
        setIsModalOpen(false);
        setEditingVehicle(null);
    };
    
    // Función que cierra el modal de documentación
    const handleCloseDocModal = () => {
        setIsDocModalOpen(false);
        setSelectedVehicle(null);
    };

    // FUNCIÓN R: Obtener todos los vehículos
    const fetchVehicles = useCallback(async () => {
        setLoading(true);
        setError('');
        try {
            const response = await axios.get<Vehicle[]>(API_BASE_URL);
            setVehicles(response.data);
        } catch (err: any) {
            if (err.response && (err.response.status === 403 || err.response.status === 401)) {
                setError('Acceso denegado. Solo administradores pueden ver la flota.');
                logout(); 
            } else {
                setError('Error al cargar vehículos. Revisa la conexión al Backend.');
            }
        } finally {
            setLoading(false);
        }
    }, [logout]);

    // FUNCIÓN D: Eliminar vehículo
    const handleDelete = async (id: number) => {
        if (!window.confirm('¿Estás seguro de que quieres eliminar este vehículo? Esta acción eliminará documentos y reservas asociadas y es irreversible.')) {
            return;
        }

        try {
            await axios.delete(`${API_BASE_URL}/${id}`);
            fetchVehicles(); 
        } catch (err: any) {
            setError('Error al eliminar el vehículo. Asegúrate de que no tenga reservas asociadas activas.');
        }
    };

    useEffect(() => {
        fetchVehicles();
    }, [fetchVehicles]); 

    if (loading) return <p className="text-indigo-600">Cargando flota...</p>;
    if (error) return <p className="text-red-500 font-semibold">{error}</p>;

    return (
        <div className="mt-8">
            {/* Modal de Creación/Edición */}
            <VehicleFormModal 
                isOpen={isModalOpen} 
                onClose={handleCloseModal}
                onSuccess={fetchVehicles} 
                initialData={editingVehicle} 
            />

            {/* Modal de Documentación (Solo se renderiza si hay un vehículo seleccionado) */}
            {selectedVehicle && (
                 <DocumentModal 
                    isOpen={isDocModalOpen} 
                    onClose={handleCloseDocModal}
                    vehicle={selectedVehicle}
                />
            )}
            

            <h3 className="text-2xl font-semibold mb-4 flex items-center space-x-2 text-gray-800">
                <FaCar className="text-indigo-600" />
                <span>Gestión de Flota ({vehicles.length} vehículos)</span>
            </h3>
            
            {/* Botón para Abrir el Modal en modo CREAR */}
            <div className="mb-4 flex justify-end">
                <button 
                    onClick={() => handleEdit(null)}
                    className="flex items-center space-x-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded transition duration-150 shadow"
                >
                    <FaPlus />
                    <span>Añadir Nuevo Vehículo</span>
                </button>
            </div>
            
            {/* Tabla de Lectura (Función R) */}
            <div className="bg-white shadow rounded-lg overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Matrícula</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Marca/Modelo</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Kilometraje</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Estado</th>
                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {vehicles.map((vehicle) => (
                            <tr key={vehicle.id} className="hover:bg-indigo-50 transition duration-100">
                                <td className="px-6 py-4 whitespace-nowrap font-medium text-indigo-700">{vehicle.license_plate}</td>
                                <td className="px-6 py-4 whitespace-nowrap">{vehicle.make} {vehicle.model}</td>
                                <td className="px-6 py-4 whitespace-nowrap">{vehicle.mileage.toLocaleString()} km</td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                        vehicle.status === 'available' ? 'bg-green-100 text-green-800' :
                                        vehicle.status === 'in_use' ? 'bg-yellow-100 text-yellow-800' :
                                        'bg-red-100 text-red-800'
                                    }`}>
                                        {vehicle.status.charAt(0).toUpperCase() + vehicle.status.slice(1)}
                                    </span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                                    {/* Botón Documentación (Crea y ve registros) */}
                                    <button onClick={() => handleViewDocs(vehicle)} title="Ver Documentación" className="text-gray-600 hover:text-indigo-800 p-2 rounded-full hover:bg-gray-100 transition duration-150">
                                        <FaBook />
                                    </button>
                                    
                                    {/* Función U: Editar */}
                                    <button onClick={() => handleEdit(vehicle)} title="Editar Vehículo" className="text-indigo-600 hover:text-indigo-800 p-2 rounded-full hover:bg-gray-100 transition duration-150">
                                        <FaEdit />
                                    </button>
                                    {/* Función D: Eliminar */}
                                    <button onClick={() => handleDelete(vehicle.id)} title="Eliminar Vehículo" className="text-red-600 hover:text-red-800 p-2 rounded-full hover:bg-gray-100 transition duration-150">
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