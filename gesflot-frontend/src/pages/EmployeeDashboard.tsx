import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { 
    FaCalendarAlt, 
    FaList, 
    FaSignOutAlt, 
    FaPlus, 
    FaCar, 
    FaClock,
    FaCheckCircle,
    FaCalendarCheck
} from 'react-icons/fa';
import ReservationModal from '../components/ReservationModal'; 
import AvailabilityCalendar from '../components/AvailabilityCalendar'; 

// Tipos de datos
interface Vehiculo { id: number; make: string; model: string; license_plate: string; }
interface Reserva {
    id: number; vehicle_id: number; license_plate: string; make: string; model: string;
    start_time: string; end_time: string; status: 'pending' | 'approved' | 'rejected' | 'completed' | 'canceled';
}

const EmployeeDashboard: React.FC = () => {
    const { user, logout } = useAuth();
    
    // Pestaña activa
    const [vistaActiva, setVistaActiva] = useState<'calendario' | 'listado'>('calendario');
    
    // Datos
    const [misReservas, setMisReservas] = useState<Reserva[]>([]);
    const [reservasGlobales, setReservasGlobales] = useState<Reserva[]>([]);
    const [vehiculos, setVehiculos] = useState<Vehiculo[]>([]);
    
    // Control de carga
    const [cargando, setCargando] = useState(true);
    const [modalAbierto, setModalAbierto] = useState(false);

    // Cargar datos del servidor
    const cargarDatos = useCallback(async () => {
        setCargando(true);
        try {
            const [resMis, resGlobal, resCoches] = await Promise.all([
                axios.get<Reserva[]>('/api/reservations/my'),
                axios.get<Reserva[]>('/api/reservations/availability'),
                axios.get<Vehiculo[]>('/api/vehicles')
            ]);

            setMisReservas(resMis.data);
            setReservasGlobales(resGlobal.data);
            setVehiculos(resCoches.data);

        } catch (err) {
            console.error("Fallo al cargar:", err);
        } finally {
            setCargando(false);
        }
    }, []);

    useEffect(() => { 
        if (user) cargarDatos(); 
    }, [user, cargarDatos]);

    // Cancelar reserva
    const cancelarReserva = async (id: number) => {
        if (!window.confirm('¿Seguro que quieres cancelar?')) return;
        try {
            await axios.put(`/api/reservations/${id}/cancel`);
            cargarDatos(); 
        } catch (error) { 
            alert('No se pudo cancelar.'); 
        }
    };

    // Cifras para el resumen
    const pendientes = misReservas.filter(r => r.status === 'pending').length;
    const confirmadas = misReservas.filter(r => r.status === 'approved').length;

    return (
        <div className="min-h-screen bg-slate-50 font-sans text-slate-800">
            {/* Modal para pedir coche */}
            <ReservationModal 
                isOpen={modalAbierto} 
                onClose={() => setModalAbierto(false)} 
                onSuccess={cargarDatos} 
                availableVehicles={vehiculos} 
            />

            {/* NAVBAR SUPERIOR (Estilo Aplicación) */}
            <header className="bg-white shadow-sm border-b border-slate-200 sticky top-0 z-30">
                <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
                    {/* Logo */}
                    <div className="flex items-center gap-2">
                        <div className="bg-indigo-600 text-white p-1.5 rounded-lg">
                            <FaCar size={18} />
                        </div>
                        <span className="font-bold text-xl text-slate-800 tracking-tight">GesFlot</span>
                    </div>

                    {/* Menú Usuario */}
                    <div className="flex items-center gap-4">
                        <div className="text-right hidden sm:block">
                            <p className="text-sm font-bold text-slate-700">{user?.name}</p>
                            <p className="text-xs text-slate-500">Empleado</p>
                        </div>
                        <div className="h-8 w-px bg-slate-200 mx-1"></div>
                        <button 
                            onClick={logout} 
                            className="text-slate-500 hover:text-red-600 transition p-2 rounded-full hover:bg-slate-100"
                            title="Salir"
                        >
                            <FaSignOutAlt />
                        </button>
                    </div>
                </div>
            </header>

            {/* CABECERA DE BIENVENIDA (Hero) */}
            <div className="bg-indigo-700 text-white pb-24 pt-12 px-4">
                <div className="max-w-5xl mx-auto">
                    <div className="flex flex-col md:flex-row justify-between items-center gap-6">
                        <div>
                            <h1 className="text-3xl font-bold mb-2">Hola, {user?.name?.split(' ')[0]} 👋</h1>
                            <p className="text-indigo-100 text-lg">¿Necesitas un vehículo para hoy?</p>
                        </div>
                        <button 
                            onClick={() => setModalAbierto(true)}
                            className="bg-white text-indigo-700 px-6 py-3 rounded-full font-bold shadow-lg hover:bg-indigo-50 transition transform hover:scale-105 flex items-center gap-2"
                        >
                            <FaPlus /> Nueva Reserva
                        </button>
                    </div>
                </div>
            </div>

            {/* CONTENIDO PRINCIPAL (Montado sobre la cabecera) */}
            <main className="max-w-5xl mx-auto px-4 -mt-16 pb-12">
                
                {/* Tarjetas de Resumen */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
                    <div className="bg-white p-5 rounded-xl shadow-md border border-slate-100 flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <div className="bg-emerald-100 text-emerald-600 p-3 rounded-full">
                                <FaCalendarCheck size={20} />
                            </div>
                            <div>
                                <p className="text-slate-500 text-sm font-medium uppercase">Confirmadas</p>
                                <p className="text-2xl font-bold text-slate-800">{confirmadas}</p>
                            </div>
                        </div>
                    </div>
                    <div className="bg-white p-5 rounded-xl shadow-md border border-slate-100 flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <div className="bg-amber-100 text-amber-600 p-3 rounded-full">
                                <FaClock size={20} />
                            </div>
                            <div>
                                <p className="text-slate-500 text-sm font-medium uppercase">Pendientes</p>
                                <p className="text-2xl font-bold text-slate-800">{pendientes}</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Selector de Vistas (Pestañas grandes) */}
                <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden mb-6">
                    <div className="flex border-b border-slate-100">
                        <button 
                            onClick={() => setVistaActiva('calendario')}
                            className={`flex-1 py-4 text-center font-medium transition flex items-center justify-center gap-2 ${
                                vistaActiva === 'calendario' 
                                ? 'text-indigo-600 border-b-2 border-indigo-600 bg-indigo-50/50' 
                                : 'text-slate-500 hover:bg-slate-50'
                            }`}
                        >
                            <FaCalendarAlt /> Calendario de Flota
                        </button>
                        <button 
                            onClick={() => setVistaActiva('listado')}
                            className={`flex-1 py-4 text-center font-medium transition flex items-center justify-center gap-2 ${
                                vistaActiva === 'listado' 
                                ? 'text-indigo-600 border-b-2 border-indigo-600 bg-indigo-50/50' 
                                : 'text-slate-500 hover:bg-slate-50'
                            }`}
                        >
                            <FaList /> Mis Reservas
                        </button>
                    </div>

                    {/* Área de contenido */}
                    <div className="p-6">
                        {cargando ? (
                            <div className="text-center py-10 text-slate-400">Cargando información...</div>
                        ) : vistaActiva === 'calendario' ? (
                            // VISTA CALENDARIO
                            <div className="animate-fade-in">
                                <div className="bg-blue-50 border border-blue-100 text-blue-800 p-4 rounded-lg mb-6 flex gap-3">
                                    <FaCheckCircle className="mt-1 flex-shrink-0" />
                                    <p className="text-sm">Consulta aquí cuándo están libres los coches. Las franjas blancas son huecos disponibles para reservar.</p>
                                </div>
                                <AvailabilityCalendar reservas={reservasGlobales} />
                            </div>
                        ) : (
                            // VISTA LISTADO
                            <div className="animate-fade-in">
                                {misReservas.length === 0 ? (
                                    <div className="text-center py-12">
                                        <p className="text-slate-400 mb-4">No tienes reservas activas.</p>
                                        <button onClick={() => setModalAbierto(true)} className="text-indigo-600 font-bold hover:underline">¡Haz tu primera reserva!</button>
                                    </div>
                                ) : (
                                    <div className="overflow-x-auto">
                                        <table className="w-full text-left border-collapse">
                                            <thead>
                                                <tr className="text-xs font-bold text-slate-500 uppercase border-b border-slate-200">
                                                    <th className="py-3 px-2">Vehículo</th>
                                                    <th className="py-3 px-2">Fechas</th>
                                                    <th className="py-3 px-2 text-center">Estado</th>
                                                    <th className="py-3 px-2 text-right">Opción</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {misReservas.map((res) => (
                                                    <tr key={res.id} className="border-b border-slate-50 hover:bg-slate-50 transition">
                                                        <td className="py-4 px-2">
                                                            <p className="font-bold text-slate-800">{res.make} {res.model}</p>
                                                            <span className="text-xs bg-slate-200 px-1.5 py-0.5 rounded text-slate-600 font-mono">{res.license_plate}</span>
                                                        </td>
                                                        <td className="py-4 px-2 text-sm text-slate-600">
                                                            <div><span className="font-bold text-xs text-slate-400">SALIDA:</span> {new Date(res.start_time).toLocaleDateString()} {new Date(res.start_time).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})}</div>
                                                            <div><span className="font-bold text-xs text-slate-400">LLEGADA:</span> {new Date(res.end_time).toLocaleDateString()} {new Date(res.end_time).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})}</div>
                                                        </td>
                                                        <td className="py-4 px-2 text-center">
                                                            <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${
                                                                res.status === 'approved' ? 'bg-emerald-100 text-emerald-700' :
                                                                res.status === 'pending' ? 'bg-amber-100 text-amber-700' :
                                                                res.status === 'rejected' ? 'bg-red-100 text-red-700' :
                                                                'bg-slate-100 text-slate-600'
                                                            }`}>
                                                                {res.status === 'approved' ? 'Aprobada' : res.status === 'pending' ? 'Pendiente' : res.status === 'canceled' ? 'Cancelada' : 'Rechazada'}
                                                            </span>
                                                        </td>
                                                        <td className="py-4 px-2 text-right">
                                                            {(res.status === 'pending' || res.status === 'approved') && (
                                                                <button 
                                                                    onClick={() => cancelarReserva(res.id)}
                                                                    className="text-red-500 text-sm font-medium hover:text-red-700 hover:bg-red-50 px-3 py-1 rounded transition"
                                                                >
                                                                    Cancelar
                                                                </button>
                                                            )}
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </main>
        </div>
    );
};

export default EmployeeDashboard;