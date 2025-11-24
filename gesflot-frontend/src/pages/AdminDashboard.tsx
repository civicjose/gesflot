import React, { useState } from 'react';
import { FaTachometerAlt, FaUsers, FaCar, FaFileAlt, FaSignOutAlt, FaCalendarCheck, FaClipboardList } from 'react-icons/fa'; // FaClipboardList añadido
import { useAuth } from '../context/AuthContext';
// Importaciones corregidas a .tsx
import UserManagement from '../components/UserManagement.tsx'; 
import VehicleList from '../components/VehicleList'; // Este no necesita .tsx si solo es VehicleList.tsx
import DocumentationManagement from '../components/DocumentationManagement.tsx';
import ReservationManagement from '../components/ReservationManagement'; 

// Definición de las secciones de navegación
type AdminSection = 'dashboard' | 'users' | 'vehicles' | 'documentation' | 'reservations';

const AdminDashboard: React.FC = () => {
    const { user, logout } = useAuth();
    const [activeSection, setActiveSection] = useState<AdminSection>('reservations'); 

    /**
     * Función para renderizar el componente de gestión activo.
     */
    const renderContent = () => {
        switch (activeSection) {
            case 'dashboard':
                return (
                    <div className="p-6 bg-white rounded-lg shadow">
                        <h2 className="text-3xl font-bold text-indigo-600 mb-4">Bienvenido, {user?.name} (Admin)</h2>
                        <p className="text-gray-600">Utiliza el menú de navegación para gestionar la flota, los usuarios y las reservas pendientes.</p>
                        <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
                            <StatCard icon={FaUsers} title="Gestión de Usuarios" value="Administra empleados y roles." color="text-yellow-500" />
                            <StatCard icon={FaCar} title="Flota y Documentación" value="Crea, edita y gestiona vehículos." color="text-green-500" />
                            <StatCard icon={FaCalendarCheck} title="Reservas Pendientes" value="Revisa y aprueba solicitudes." color="text-indigo-500" />
                        </div>
                    </div>
                );
            case 'users':
                return <UserManagement />;
            case 'vehicles':
                return <VehicleList />;
            case 'documentation':
                return <DocumentationManagement />;
            case 'reservations':
                return <ReservationManagement />; 
            default:
                return <h2 className="text-xl">Selecciona una sección</h2>;
        }
    };

    return (
        <div className="min-h-screen flex bg-gray-50">
            {/* Sidebar de Navegación */}
            <nav className="w-64 bg-indigo-800 text-white flex flex-col fixed h-full shadow-xl">
                {/* Logo / Título */}
                <div className="p-6 text-2xl font-bold border-b border-indigo-700">
                    GesFlot Admin
                </div>

                {/* Enlaces de Navegación */}
                <div className="flex-1 p-4 space-y-2">
                    <NavItem 
                        icon={FaTachometerAlt} 
                        label="Dashboard" 
                        isActive={activeSection === 'dashboard'} 
                        onClick={() => setActiveSection('dashboard')} 
                    />
                    <NavItem 
                        icon={FaUsers} 
                        label="Gestión de Usuarios" 
                        isActive={activeSection === 'users'} 
                        onClick={() => setActiveSection('users')} 
                    />
                    <NavItem 
                        icon={FaCar} 
                        label="Gestión de Vehículos" 
                        isActive={activeSection === 'vehicles'} 
                        onClick={() => setActiveSection('vehicles')} 
                    />
                    <NavItem 
                        icon={FaFileAlt} 
                        label="Documentación Flota" 
                        isActive={activeSection === 'documentation'} 
                        onClick={() => setActiveSection('documentation')} 
                    />
                    <NavItem 
                        icon={FaCalendarCheck} 
                        label="Gestión de Reservas" 
                        isActive={activeSection === 'reservations'} 
                        onClick={() => setActiveSection('reservations')} 
                    />
                </div>

                {/* Pie de Página / Usuario */}
                <div className="p-6 border-t border-indigo-700">
                    <p className="text-sm font-semibold truncate">{user?.name}</p>
                    <button 
                        onClick={logout}
                        className="mt-2 w-full flex items-center justify-center space-x-2 p-2 bg-red-600 rounded-lg hover:bg-red-700 transition duration-150 text-sm"
                    >
                        <FaSignOutAlt />
                        <span>Cerrar Sesión</span>
                    </button>
                </div>
            </nav>

            {/* Contenido Principal */}
            <div className="flex-1 ml-64 p-8">
                <header className="mb-8">
                    <h1 className="text-4xl font-extrabold text-gray-900">
                        {activeSection.charAt(0).toUpperCase() + activeSection.slice(1).replace('_', ' ')}
                    </h1>
                </header>

                {renderContent()}
            </div>
        </div>
    );
};

// --- Componentes Auxiliares ---
const NavItem = ({ icon: Icon, label, isActive, onClick }: { icon: any, label: string, isActive: boolean, onClick: () => void }) => (
    <button
        onClick={onClick}
        className={`w-full flex items-center space-x-3 p-3 rounded-lg transition duration-150 ${
            isActive ? 'bg-indigo-600 shadow-md' : 'hover:bg-indigo-700'
        }`}
    >
        <Icon className="text-xl" />
        <span className="font-medium">{label}</span>
    </button>
);

const StatCard = ({ icon: Icon, title, value, color }: { icon: any, title: string, value: string, color: string }) => (
    <div className="p-4 border rounded-lg flex items-center space-x-4 bg-white">
        <Icon className={`text-3xl ${color}`} />
        <div>
            <p className="text-lg font-semibold text-gray-800">{title}</p>
            <p className="text-sm text-gray-500">{value}</p>
        </div>
    </div>
);


export default AdminDashboard;