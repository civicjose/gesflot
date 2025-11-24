import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { FaTrash, FaUserShield, FaUserTie, FaUsers, FaUserPlus } from 'react-icons/fa';
import { useAuth } from '../context/AuthContext';
import UserFormModal from './UserFormModal'; // <--- Importamos el nuevo modal

interface User {
    id: number;
    name: string;
    email: string;
    role: 'admin' | 'employee';
    created_at: string;
}

const UserManagement: React.FC = () => {
    const [users, setUsers] = useState<User[]>([]);
    const [error, setError] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false); // Estado del modal
    const { user: currentUser } = useAuth(); 

    const fetchUsers = useCallback(async () => {
        try {
            const response = await axios.get<User[]>('/api/users');
            setUsers(response.data);
        } catch (err) {
            setError('Error al cargar usuarios.');
        }
    }, []);

    useEffect(() => {
        fetchUsers();
    }, [fetchUsers]);

    const handleDelete = async (id: number) => {
        if (!window.confirm('¿Eliminar este usuario permanentemente?')) return;
        try {
            await axios.delete(`/api/users/${id}`);
            fetchUsers();
        } catch (err: any) {
            alert(err.response?.data?.message || 'Error al eliminar');
        }
    };

    const handleRoleChange = async (id: number, currentRole: string) => {
        const newRole = currentRole === 'admin' ? 'employee' : 'admin';
        if (!window.confirm(`¿Cambiar rol de este usuario a ${newRole.toUpperCase()}?`)) return;
        
        try {
            await axios.put(`/api/users/${id}/role`, { role: newRole });
            fetchUsers();
        } catch (err: any) {
            alert(err.response?.data?.message || 'Error al cambiar rol');
        }
    };

    return (
        <div className="mt-8">
            {/* Modal de Creación */}
            <UserFormModal 
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSuccess={fetchUsers}
            />

             <div className="flex justify-between items-center mb-6">
                <h3 className="text-2xl font-semibold text-gray-800 flex items-center space-x-2">
                    <FaUsers className="text-indigo-600" />
                    <span>Gestión de Usuarios y Roles</span>
                </h3>
                
                {/* Botón Añadir Usuario */}
                <button 
                    onClick={() => setIsModalOpen(true)}
                    className="flex items-center space-x-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded transition duration-150 shadow"
                >
                    <FaUserPlus />
                    <span>Añadir Usuario</span>
                </button>
             </div>

            {error && <p className="text-red-500 mb-4">{error}</p>}
            
            <div className="bg-white shadow rounded-lg overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Nombre</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Rol</th>
                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Acciones</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {users.map((u) => (
                            <tr key={u.id} className="hover:bg-gray-50">
                                <td className="px-6 py-4 whitespace-nowrap font-medium">{u.name}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-gray-600">{u.email}</td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                        u.role === 'admin' ? 'bg-purple-100 text-purple-800' : 'bg-green-100 text-green-800'
                                    }`}>
                                        {u.role.toUpperCase()}
                                    </span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                                    {u.id !== currentUser?.id && (
                                        <>
                                            <button onClick={() => handleRoleChange(u.id, u.role)} title="Cambiar Rol" className="text-indigo-600 hover:text-indigo-900 p-2 hover:bg-indigo-50 rounded-full">
                                                {u.role === 'admin' ? <FaUserTie /> : <FaUserShield />}
                                            </button>
                                            <button onClick={() => handleDelete(u.id)} title="Eliminar Usuario" className="text-red-600 hover:text-red-900 p-2 hover:bg-red-50 rounded-full">
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

export default UserManagement;