import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
    FaTachometerAlt, 
    FaUsers, 
    FaCar, 
    FaFileAlt, 
    FaSignOutAlt, 
    FaCalendarCheck, 
    FaClipboardList,
    FaArrowRight,
    FaBell
} from 'react-icons/fa';
import { useAuth } from '../context/AuthContext';

// Importamos los componentes de gestión
import UserManagement from '../components/UserManagement';
import VehicleList from '../components/VehicleList';
import DocumentationManagement from '../components/DocumentationManagement';
import ReservationManagement from '../components/ReservationManagement';

type SeccionAdmin = 'dashboard' | 'usuarios' | 'vehiculos' | 'documentacion' | 'reservas';

const AdminDashboard: React.FC = () => {
    const { user, logout } = useAuth();
    
    // Estado para controlar la navegación
    const [seccionActiva, setSeccionActiva] = useState<SeccionAdmin>('dashboard');
    
    // Estado para los datos del resumen
    const [estadisticas, setEstadisticas] = useState({
        usuarios: 0,
        vehiculos: 0,
        pendientes: 0
    });

    // Cargar datos iniciales del dashboard
    useEffect(() => {
        const cargarDatosDashboard = async () => {
            try {
                const [resUsers, resVehicles, resReservas] = await Promise.all([
                    axios.get('/api/users'),
                    axios.get('/api/vehicles'),
                    axios.get('/api/reservations/all')
                ]);

                const totalPendientes = resReservas.data.filter((r: any) => r.status === 'pending').length;

                setEstadisticas({
                    usuarios: resUsers.data.length,
                    vehiculos: resVehicles.data.length,
                    pendientes: totalPendientes
                });
            } catch (error) {
                console.error("Error cargando datos del dashboard", error);
            }
        };

        if (seccionActiva === 'dashboard') {
            cargarDatosDashboard();
        }
    }, [seccionActiva]);

    // Título dinámico de la cabecera
    const obtenerTituloSeccion = () => {
        switch (seccionActiva) {
            case 'usuarios': return 'Gestión de Usuarios';
            case 'vehiculos': return 'Flota de Vehículos';
            case 'documentacion': return 'Documentación y Alertas';
            case 'reservas': return 'Control de Reservas';
            default: return 'Panel de Control';
        }
    };

    // Renderizado condicional del contenido
    const renderizarContenido = () => {
        switch (seccionActiva) {
            case 'dashboard':
                return (
                    <div className="animate-fade-in space-y-6">
                        {/* Sección de bienvenida */}
                        <div className="flex justify-between items-end">
                            <div>
                                <h2 className="text-2xl font-bold text-slate-800">Bienvenido, {user?.name}</h2>
                                <p className="text-slate-500 mt-1">Aquí tienes un resumen de la actividad de hoy.</p>
                            </div>
                            <div className="text-sm text-slate-400 font-medium">
                                {new Date().toLocaleDateString('es-ES', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                            </div>
                        </div>
                        
                        {/* Tarjetas de estadísticas (KPIs) */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            {/* Tarjeta Pendientes (Prioritaria) */}
                            <div 
                                onClick={() => setSeccionActiva('reservas')}
                                className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition cursor-pointer group relative overflow-hidden"
                            >
                                <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition">
                                    <FaCalendarCheck size={60} className="text-indigo-600" />
                                </div>
                                <div className="flex flex-col">
                                    <span className="text-sm font-semibold text-slate-500 uppercase tracking-wider">Solicitudes Pendientes</span>
                                    <span className="text-4xl font-bold text-slate-900 mt-2">{estadisticas.pendientes}</span>
                                    <span className="text-sm text-indigo-600 mt-4 flex items-center gap-1 font-medium">
                                        Ver detalles <FaArrowRight size={12} />
                                    </span>
                                </div>
                            </div>

                            {/* Tarjeta Vehículos */}
                            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex flex-col">
                                <div className="flex justify-between items-start">
                                    <div className="p-3 bg-emerald-50 rounded-lg text-emerald-600">
                                        <FaCar size={20} />
                                    </div>
                                </div>
                                <span className="text-3xl font-bold text-slate-900 mt-4">{estadisticas.vehiculos}</span>
                                <span className="text-sm text-slate-500 font-medium">Vehículos activos</span>
                            </div>

                            {/* Tarjeta Usuarios */}
                            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex flex-col">
                                <div className="flex justify-between items-start">
                                    <div className="p-3 bg-blue-50 rounded-lg text-blue-600">
                                        <FaUsers size={20} />
                                    </div>
                                </div>
                                <span className="text-3xl font-bold text-slate-900 mt-4">{estadisticas.usuarios}</span>
                                <span className="text-sm text-slate-500 font-medium">Empleados registrados</span>
                            </div>
                        </div>

                        {/* Alerta de acción requerida */}
                        {estadisticas.pendientes > 0 && (
                            <div className="bg-indigo-900 text-white p-6 rounded-xl shadow-lg flex items-center justify-between relative overflow-hidden">
                                <div className="absolute -left-4 -bottom-10 opacity-20">
                                    <FaClipboardList size={120} />
                                </div>
                                <div className="relative z-10 flex items-center gap-4">
                                    <div className="p-3 bg-white/10 rounded-full backdrop-blur-sm animate-pulse">
                                        <FaBell size={20} />
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-lg">Atención requerida</h4>
                                        <p className="text-indigo-200 text-sm">Hay {estadisticas.pendientes} reservas esperando aprobación.</p>
                                    </div>
                                </div>
                                <button 
                                    onClick={() => setSeccionActiva('reservas')}
                                    className="relative z-10 bg-white text-indigo-900 px-5 py-2.5 rounded-lg font-bold text-sm hover:bg-indigo-50 transition shadow-sm"
                                >
                                    Gestionar ahora
                                </button>
                            </div>
                        )}
                    </div>
                );
            case 'usuarios': return <UserManagement />;
            case 'vehiculos': return <VehicleList />;
            case 'documentacion': return <DocumentationManagement />;
            case 'reservas': return <ReservationManagement />;
            default: return <p>Sección no encontrada.</p>;
        }
    };

    return (
        <div className="min-h-screen flex bg-slate-100 font-sans text-slate-800">
            
            {/* SIDEBAR OSCURO: Diseño profesional */}
            <aside className="w-64 bg-slate-900 text-slate-300 flex flex-col fixed h-full z-30 shadow-xl transition-all duration-300">
                
                {/* Marca */}
                <div className="h-16 flex items-center px-6 border-b border-slate-800 bg-slate-950">
                    <div className="bg-indigo-600 text-white p-1.5 rounded mr-3 shadow-lg shadow-indigo-900/20">
                        <FaCar size={16} />
                    </div>
                    <span className="font-bold text-lg text-white tracking-tight">GesFlot Admin</span>
                </div>

                {/* Navegación */}
                <div className="flex-1 py-6 px-3 space-y-1 overflow-y-auto">
                    <div className="px-3 mb-2 text-xs font-bold text-slate-500 uppercase tracking-wider">Principal</div>
                    <BotonMenu 
                        icono={FaTachometerAlt} 
                        texto="Dashboard" 
                        activo={seccionActiva === 'dashboard'} 
                        onClick={() => setSeccionActiva('dashboard')} 
                    />
                    <BotonMenu 
                        icono={FaCalendarCheck} 
                        texto="Reservas" 
                        activo={seccionActiva === 'reservas'} 
                        onClick={() => setSeccionActiva('reservas')} 
                        badge={estadisticas.pendientes}
                    />

                    <div className="px-3 mt-8 mb-2 text-xs font-bold text-slate-500 uppercase tracking-wider">Administración</div>
                    <BotonMenu 
                        icono={FaCar} 
                        texto="Vehículos" 
                        activo={seccionActiva === 'vehiculos'} 
                        onClick={() => setSeccionActiva('vehiculos')} 
                    />
                    <BotonMenu 
                        icono={FaUsers} 
                        texto="Usuarios" 
                        activo={seccionActiva === 'usuarios'} 
                        onClick={() => setSeccionActiva('usuarios')} 
                    />
                    <BotonMenu 
                        icono={FaFileAlt} 
                        texto="Documentación" 
                        activo={seccionActiva === 'documentacion'} 
                        onClick={() => setSeccionActiva('documentacion')} 
                    />
                </div>

                {/* Perfil Admin */}
                <div className="p-4 border-t border-slate-800 bg-slate-950">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded bg-indigo-600 flex items-center justify-center text-xs font-bold text-white">
                                {user?.name?.charAt(0).toUpperCase()}
                            </div>
                            <div className="overflow-hidden">
                                <p className="text-sm font-bold text-white truncate w-24">{user?.name}</p>
                                <p className="text-xs text-slate-500">Admin</p>
                            </div>
                        </div>
                        <button 
                            onClick={logout}
                            className="text-slate-400 hover:text-white transition p-2 rounded hover:bg-slate-800"
                            title="Cerrar sesión"
                        >
                            <FaSignOutAlt size={14} />
                        </button>
                    </div>
                </div>
            </aside>

            {/* ÁREA PRINCIPAL */}
            <main className="flex-1 ml-64 transition-all duration-300">
                {/* Header Superior Blanco */}
                <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-8 sticky top-0 z-20 shadow-sm">
                    <h1 className="text-xl font-bold text-slate-800">
                        {obtenerTituloSeccion()}
                    </h1>
                    <div className="flex items-center gap-4">
                        <span className="text-xs bg-indigo-50 text-indigo-700 px-2 py-1 rounded font-medium border border-indigo-100">
                            v1.0.0
                        </span>
                    </div>
                </header>

                {/* Contenido con padding */}
                <div className="p-8">
                    {/* Contenedor estilo tarjeta para las tablas */}
                    {seccionActiva !== 'dashboard' ? (
                        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden min-h-[600px] p-6">
                            {renderizarContenido()}
                        </div>
                    ) : (
                        renderizarContenido()
                    )}
                </div>
            </main>
        </div>
    );
};

// Componente de botón para Sidebar Oscuro
interface BotonMenuProps {
    icono: React.ElementType;
    texto: string;
    activo: boolean;
    onClick: () => void;
    badge?: number;
}

const BotonMenu: React.FC<BotonMenuProps> = ({ icono: Icono, texto, activo, onClick, badge }) => (
    <button
        onClick={onClick}
        className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg transition-all duration-200 group mb-1 ${
            activo 
            ? 'bg-indigo-600 text-white shadow-md' 
            : 'text-slate-400 hover:bg-slate-800 hover:text-white'
        }`}
    >
        <div className="flex items-center gap-3">
            <Icono className={`text-lg ${activo ? 'text-indigo-200' : 'text-slate-500 group-hover:text-slate-300'}`} />
            <span className="font-medium text-sm">{texto}</span>
        </div>
        {badge !== undefined && badge > 0 && (
            <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                activo ? 'bg-indigo-500 text-white' : 'bg-slate-800 text-slate-300 group-hover:text-white'
            }`}>
                {badge}
            </span>
        )}
    </button>
);

export default AdminDashboard;