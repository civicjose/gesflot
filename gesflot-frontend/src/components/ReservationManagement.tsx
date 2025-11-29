import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { FaCheckCircle, FaTimesCircle, FaCalendarCheck, FaTrash, FaClipboardList } from 'react-icons/fa';
import { useAuth } from '../context/AuthContext';

interface Reserva {
    id: number;
    user_name: string;
    license_plate: string;
    make: string;
    model: string;
    start_time: string;
    end_time: string;
    status: 'pending' | 'approved' | 'rejected' | 'completed' | 'canceled';
}

const ReservationManagement: React.FC = () => {
    const [reservas, setReservas] = useState<Reserva[]>([]);
    const [cargando, setCargando] = useState(true);
    const [error, setError] = useState('');
    const { logout } = useAuth();
    
    const cargarReservas = useCallback(async () => {
        setCargando(true);
        setError('');
        try {
            const res = await axios.get<Reserva[]>('/api/reservations/all');
            setReservas(res.data);
        } catch (err: any) {
             if (err.response?.status === 403 || err.response?.status === 401) {
                setError('No tienes permiso.');
                logout(); 
            } else {
                setError('Error al cargar reservas.');
            }
        } finally {
            setCargando(false);
        }
    }, [logout]);
    
    const actualizarEstado = async (id: number, nuevoEstado: string) => {
        let accion = '';
        if (nuevoEstado === 'approved') accion = 'aprobar';
        if (nuevoEstado === 'rejected') accion = 'rechazar';
        if (nuevoEstado === 'completed') accion = 'marcar como completada';
        if (nuevoEstado === 'canceled') accion = 'cancelar';

        if (!window.confirm(`¿Estás seguro de ${accion} esta reserva?`)) return;
        
        try {
            await axios.put(`/api/reservations/${id}/status`, { status: nuevoEstado });
            cargarReservas(); 
        } catch (err) {
            setError('Error al actualizar.');
        }
    };

    // Función auxiliar para traducir los estados
    const traducirEstado = (status: string) => {
        switch (status) {
            case 'pending': return 'Pendiente';
            case 'approved': return 'Aprobada';
            case 'rejected': return 'Rechazada';
            case 'completed': return 'Completada';
            case 'canceled': return 'Cancelada';
            default: return status;
        }
    };
    
    useEffect(() => {
        cargarReservas();
    }, [cargarReservas]);

    if (cargando) return <p className="text-indigo-600">Cargando...</p>;
    if (error) return <p className="text-red-500 font-semibold">{error}</p>;

    const pendientes = reservas.filter(r => r.status === 'pending');
    
    return (
        <div className="mt-8">
            <h3 className="text-2xl font-semibold mb-6 text-gray-800 flex items-center space-x-2">
                <FaClipboardList className="text-indigo-600" />
                <span>Control de solicitudes ({reservas.length})</span>
            </h3>

            <div className="mb-6 p-4 bg-yellow-50 border-l-4 border-yellow-500 shadow-md rounded-lg">
                <p className="font-bold text-yellow-800">Pendientes de revisión:</p>
                <span className="text-2xl font-extrabold text-yellow-700">{pendientes.length}</span>
            </div>

            <div className="bg-white shadow rounded-lg overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Coche / Usuario</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Fechas</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Estado</th>
                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Acciones</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {reservas.map((res) => (
                            <tr key={res.id} className="hover:bg-indigo-50 transition">
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <p className="font-semibold">{res.make} ({res.license_plate})</p>
                                    <p className="text-xs text-gray-500">Solicitado por: {res.user_name}</p>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                                    {new Date(res.start_time).toLocaleDateString()} <br/>
                                    a {new Date(res.end_time).toLocaleDateString()}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                        res.status === 'approved' ? 'bg-green-100 text-green-800' :
                                        res.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                                        res.status === 'rejected' || res.status === 'canceled' ? 'bg-red-100 text-red-800' :
                                        'bg-blue-100 text-blue-800'
                                    }`}>
                                        {/* AQUÍ ESTÁ EL CAMBIO: Usamos la función de traducción */}
                                        {traducirEstado(res.status)}
                                    </span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                                    {res.status === 'pending' && (
                                        <>
                                            <button onClick={() => actualizarEstado(res.id, 'approved')} className="text-green-600 hover:text-green-800 p-2" title="Aprobar">
                                                <FaCheckCircle size={18} />
                                            </button>
                                            <button onClick={() => actualizarEstado(res.id, 'rejected')} className="text-red-600 hover:text-red-800 p-2" title="Rechazar">
                                                <FaTimesCircle size={18} />
                                            </button>
                                        </>
                                    )}
                                    {res.status === 'approved' && (
                                        <>
                                            <button onClick={() => actualizarEstado(res.id, 'completed')} className="text-blue-600 hover:text-blue-800 p-2" title="Finalizar">
                                                <FaCalendarCheck size={18} />
                                            </button>
                                            <button onClick={() => actualizarEstado(res.id, 'canceled')} className="text-red-600 hover:text-red-800 p-2" title="Cancelar">
                                                <FaTrash size={18} />
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