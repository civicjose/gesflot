import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { FaCalendarAlt, FaClipboardList, FaSignOutAlt, FaPlus, FaTimes } from 'react-icons/fa';
import ReservationModal from '../components/ReservationModal.tsx'; 

// Tipos de datos
interface Vehicle {
    id: number;
    make: string;
    model: string;
    license_plate: string;
}

interface Reservation {
    id: number;
    vehicle_id: number;
    license_plate: string;
    make: string;
    model: string;
    start_time: string;
    end_time: string;
    status: 'pending' | 'approved' | 'rejected' | 'completed' | 'canceled';
}

const EmployeeDashboard: React.FC = () => {
    const { user, logout } = useAuth();
    const [activeTab, setActiveTab] = useState<'calendar' | 'my_reservations'>('calendar');
    const [reservations, setReservations] = useState<Reservation[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [isReservationModalOpen, setIsReservationModalOpen] = useState(false);
    const [vehicles, setVehicles] = useState<Vehicle[]>([]);

    // FUNCIÓN R: Obtener las reservas del empleado logueado
    const fetchMyReservations = useCallback(async () => {
        setLoading(true);
        setError('');
        try {
            const response = await axios.get<Reservation[]>('/api/reservations/my');
            setReservations(response.data);
        } catch (err: any) {
            setError('Error al cargar tus reservas.');
        } finally {
            setLoading(false);
        }
    }, []);

    // FUNCIÓN C: Cancelar reserva
const handleCancelReservation = async (reservationId: number) => {
        if (!window.confirm('¿Estás seguro de que deseas cancelar esta reserva?')) return;
        try {
            // Llamamos a la ruta de cancelación
            await axios.put(`/api/reservations/${reservationId}/cancel`); 
            
            // --- 🚨 SOLUCIÓN CLAVE: Llamar a la función de lectura tras el éxito 🚨 ---
            fetchMyReservations(); // Esto fuerza la actualización del estado 'reservations'
            // ----------------------------------------------------------------------
        } catch (err: any) {
            const message = err.response?.data?.message || 'Error al cancelar. Solo puedes cancelar si está Pendiente o Aprobada.';
            setError(message);
        }
    };

    // FUNCIÓN R: Obtener lista de vehículos para el formulario de reserva
    const fetchVehiclesForBooking = useCallback(async () => {
        try {
            const response = await axios.get<Vehicle[]>('/api/vehicles');
            setVehicles(response.data);
        } catch (err) {
            // Manejo silencioso de error (no queremos mostrar un error gigante si no puede cargar la lista)
        }
    }, []);

    // --- SOLUCIÓN DEL ERROR 401: Esperar al usuario ---
    useEffect(() => {
        // Ejecutar las funciones SOLO si el objeto 'user' ha sido cargado del contexto
        if (user) { 
            fetchVehiclesForBooking();
            fetchMyReservations();
        }
    }, [fetchVehiclesForBooking, fetchMyReservations, user]); 
    // --------------------------------------------------
    
    // Función para renderizar el contenido de la pestaña activa
    const renderContent = () => {
        if (activeTab === 'calendar') {
            // --- PESTAÑA CALENDARIO ---
            return (
                <div className="bg-white p-6 shadow rounded-lg">
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-2xl font-semibold text-gray-800">Calendario de Disponibilidad (PENDIENTE DE IMPLEMENTAR)</h2>
                        <button 
                            onClick={() => setIsReservationModalOpen(true)}
                            className="flex items-center space-x-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded transition duration-150 shadow"
                            disabled={!vehicles.length}
                        >
                            <FaPlus />
                            <span>Solicitar Reserva</span>
                        </button>
                    </div>
                    {vehicles.length === 0 && user && !error && <p className="text-red-500 font-semibold mb-4">No se pudo cargar la flota de vehículos o la flota está vacía.</p>}
                    <div className="border border-gray-300 h-96 flex items-center justify-center bg-gray-50">
                        <p className="text-gray-500 italic">Aquí se integrará el componente de Calendario para visualizar la disponibilidad de los vehículos.</p>
                    </div>
                </div>
            );
        } else {
            // --- PESTAÑA MIS RESERVAS ---
            if (loading && user) return <p className="text-indigo-600 p-4">Cargando tus reservas...</p>;
            
            return (
                <div className="bg-white p-6 shadow rounded-lg">
                    <h2 className="text-2xl font-semibold text-gray-800 mb-4">Mis Solicitudes de Reserva</h2>
                    
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Vehículo</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Período</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Estado</th>
                                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {reservations.map((res) => (
                                    <tr key={res.id}>
                                        <td className="px-6 py-4 whitespace-nowrap">{res.make} ({res.license_plate})</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                                            De: {new Date(res.start_time).toLocaleString()} <br/>
                                            A: {new Date(res.end_time).toLocaleString()}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                                res.status === 'approved' ? 'bg-green-100 text-green-800' :
                                                res.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                                                'bg-red-100 text-red-800'
                                            }`}>
                                                {res.status.charAt(0).toUpperCase() + res.status.slice(1)}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                            {res.status === 'pending' || res.status === 'approved' ? (
                                                <button 
                                                    onClick={() => handleCancelReservation(res.id)}
                                                    className="text-red-600 hover:text-red-800 transition duration-150 p-2 rounded-full hover:bg-gray-100"
                                                    title="Cancelar Reserva"
                                                >
                                                    <FaTimes />
                                                </button>
                                            ) : null}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                    {reservations.length === 0 && <p className="mt-4 text-gray-500 italic">No tienes reservas activas ni pendientes.</p>}
                </div>
            );
        }
    };


    return (
        <div className="min-h-screen p-8 bg-gray-50">
            {/* Modal de Solicitud de Reserva */}
            <ReservationModal 
                isOpen={isReservationModalOpen}
                onClose={() => setIsReservationModalOpen(false)}
                onSuccess={fetchMyReservations}
                availableVehicles={vehicles}
            />

            <header className="flex justify-between items-center bg-white p-4 shadow rounded-lg sticky top-0 z-10">
                <h1 className="text-2xl font-bold text-indigo-600">GesFlot - Dashboard de Empleado</h1>
                <div className="flex items-center space-x-4">
                    <p className="text-gray-700 hidden sm:block">Bienvenido, {user?.name}</p>
                    <button 
                        onClick={logout}
                        className="bg-red-500 hover:bg-red-600 text-white font-semibold py-2 px-4 rounded transition duration-150 flex items-center space-x-2"
                    >
                        <FaSignOutAlt />
                        <span className="hidden sm:inline">Cerrar Sesión</span>
                    </button>
                </div>
            </header>

            <main className="mt-8">
                {/* Navegación por pestañas */}
                <div className="flex border-b border-gray-300 mb-6">
                    <button 
                        onClick={() => setActiveTab('calendar')}
                        className={`py-3 px-6 font-semibold transition duration-150 flex items-center space-x-2 ${
                            activeTab === 'calendar' ? 'text-indigo-600 border-b-2 border-indigo-600' : 'text-gray-500 hover:text-indigo-600'
                        }`}
                    >
                        <FaCalendarAlt />
                        <span>Disponibilidad</span>
                    </button>
                    <button 
                        onClick={() => setActiveTab('my_reservations')}
                        className={`py-3 px-6 font-semibold transition duration-150 flex items-center space-x-2 ${
                            activeTab === 'my_reservations' ? 'text-indigo-600 border-b-2 border-indigo-600' : 'text-gray-500 hover:text-indigo-600'
                        }`}
                    >
                        <FaClipboardList />
                        <span>Mis Reservas</span>
                    </button>
                </div>
                
                {error && <p className="text-red-500 mb-4 font-semibold">{error}</p>}
                
                {renderContent()}
            </main>
        </div>
    );
};

export default EmployeeDashboard;