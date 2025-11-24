import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { FaCheckCircle, FaTimesCircle, FaClock, FaCalendarCheck, FaTrash, FaClipboardList } from 'react-icons/fa';
import { useAuth } from '../context/AuthContext';

// Tipos de datos
interface Reservation {
    id: number;
    user_name: string; // Datos unidos desde el backend
    license_plate: string;
    make: string;
    model: string;
    start_time: string;
    end_time: string;
    status: 'pending' | 'approved' | 'rejected' | 'completed' | 'canceled';
}

const ReservationManagement: React.FC = () => {
    const [reservations, setReservations] = useState<Reservation[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const { logout } = useAuth();
    
    // FUNCIÓN R: Obtener todas las reservas (Admin)
    const fetchAllReservations = useCallback(async () => {
        setLoading(true);
        setError('');
        try {
            // Llama a la ruta GET /api/reservations/all
            const response = await axios.get<Reservation[]>('/api/reservations/all');
            setReservations(response.data);
        } catch (err: any) {
             if (err.response?.status === 403 || err.response?.status === 401) {
                setError('Acceso denegado. Se requiere Token de Administrador.');
                logout(); 
            } else {
                setError('Error al cargar todas las reservas.');
            }
        } finally {
            setLoading(false);
        }
    }, [logout]);
    
    // FUNCIÓN U: Cambiar Estado (Aprobar/Rechazar/Completar)
    const handleUpdateStatus = async (reservationId: number, newStatus: 'approved' | 'rejected' | 'completed' | 'canceled') => {
        if (!window.confirm(`¿Estás seguro de que quieres cambiar el estado de la reserva ${reservationId} a ${newStatus}?`)) return;
        
        try {
            // Llama a la ruta PUT /api/reservations/:id/status (protegida por isAdmin)
            await axios.put(`/api/reservations/${reservationId}/status`, { status: newStatus });
            fetchAllReservations(); // Recargar la lista tras el éxito
        } catch (err) {
            setError(`Error al actualizar estado. Solo puedes pasar a 'completed' si la reserva fue 'approved'.`);
        }
    };
    
    useEffect(() => {
        fetchAllReservations();
    }, [fetchAllReservations]);

    if (loading) return <p className="text-indigo-600">Cargando gestión de reservas...</p>;
    if (error) return <p className="text-red-500 font-semibold">{error}</p>;

    const pendingReservations = reservations.filter(r => r.status === 'pending');
    
    return (
        <div className="mt-8">
            <h3 className="text-2xl font-semibold mb-6 text-gray-800 flex items-center space-x-2">
                <FaClipboardList className="text-indigo-600" />
                <span>Gestión de Solicitudes de Reserva ({reservations.length} totales)</span>
            </h3>

            {/* Tarjeta de Resumen */}
            <div className="mb-6 p-4 bg-yellow-50 border-l-4 border-yellow-500 shadow-md rounded-lg">
                <p className="font-bold text-yellow-800">Reservas Pendientes de Aprobación:</p>
                <span className="text-2xl font-extrabold text-yellow-700">{pendingReservations.length}</span>
            </div>

            {error && <p className="text-red-500 mb-4">{error}</p>}

            {/* Tabla de Reservas */}
            <div className="bg-white shadow rounded-lg overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Vehículo / Usuario</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Período</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Estado</th>
                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {reservations.map((res) => (
                            <tr key={res.id} className="hover:bg-indigo-50 transition duration-100">
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <p className="font-semibold">{res.make} ({res.license_plate})</p>
                                    <p className="text-xs text-gray-500">Solicitante: {res.user_name}</p>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                                    {new Date(res.start_time).toLocaleString()} <br/>
                                    a {new Date(res.end_time).toLocaleString()}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                        res.status === 'approved' ? 'bg-green-100 text-green-800' :
                                        res.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                                        res.status === 'rejected' || res.status === 'canceled' ? 'bg-red-100 text-red-800' :
                                        'bg-blue-100 text-blue-800'
                                    }`}>
                                        {res.status.toUpperCase()}
                                    </span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                                    {res.status === 'pending' && (
                                        <>
                                            {/* Aprobar */}
                                            <button 
                                                onClick={() => handleUpdateStatus(res.id, 'approved')}
                                                className="text-green-600 hover:text-green-800 p-2 rounded-full hover:bg-gray-100"
                                                title="Aprobar"
                                            >
                                                <FaCheckCircle />
                                            </button>
                                            {/* Rechazar */}
                                            <button 
                                                onClick={() => handleUpdateStatus(res.id, 'rejected')}
                                                className="text-red-600 hover:text-red-800 p-2 rounded-full hover:bg-gray-100"
                                                title="Rechazar"
                                            >
                                                <FaTimesCircle />
                                            </button>
                                        </>
                                    )}
                                    {res.status === 'approved' && (
                                        <>
                                            {/* Marcar como Completa */}
                                            <button 
                                                onClick={() => handleUpdateStatus(res.id, 'completed')}
                                                className="text-blue-600 hover:text-blue-800 p-2 rounded-full hover:bg-gray-100"
                                                title="Marcar como Completada"
                                            >
                                                <FaCalendarCheck />
                                            </button>
                                            {/* Cancelar (Si el Admin lo ve necesario) */}
                                            <button 
                                                onClick={() => handleUpdateStatus(res.id, 'canceled')}
                                                className="text-red-600 hover:text-red-800 p-2 rounded-full hover:bg-gray-100"
                                                title="Cancelar Reserva"
                                            >
                                                <FaTrash />
                                            </button>
                                        </>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default ReservationManagement;