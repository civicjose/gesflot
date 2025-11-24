import React, { useState } from 'react';
import axios from 'axios';
import { FaTimes, FaSave, FaUserPlus } from 'react-icons/fa';

interface UserFormModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
}

const UserFormModal: React.FC<UserFormModalProps> = ({ isOpen, onClose, onSuccess }) => {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        role: 'employee', // Por defecto creamos empleados
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    if (!isOpen) return null;

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            await axios.post('/api/users', formData);
            onSuccess();
            onClose();
            setFormData({ name: '', email: '', password: '', role: 'employee' }); // Reset
        } catch (err: any) {
            setError(err.response?.data?.message || 'Error al crear usuario.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-gray-900 bg-opacity-75 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-md transition-transform duration-300 transform scale-100">
                
                {/* Cabecera */}
                <div className="flex justify-between items-center p-6 border-b border-gray-200 bg-indigo-600 rounded-t-xl">
                    <h3 className="text-xl font-bold text-white flex items-center space-x-2">
                        <FaUserPlus />
                        <span>Crear Nuevo Usuario</span>
                    </h3>
                    <button onClick={onClose} className="text-white hover:text-indigo-200 transition">
                        <FaTimes size={20} />
                    </button>
                </div>

                {/* Formulario */}
                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Nombre Completo</label>
                        <input type="text" name="name" value={formData.name} onChange={handleChange} required
                            className="w-full p-2 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Correo Electrónico</label>
                        <input type="email" name="email" value={formData.email} onChange={handleChange} required
                            className="w-full p-2 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Contraseña Inicial</label>
                        <input type="password" name="password" value={formData.password} onChange={handleChange} required
                            className="w-full p-2 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Rol Asignado</label>
                        <select name="role" value={formData.role} onChange={handleChange}
                            className="w-full p-2 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500 bg-white">
                            <option value="employee">Empleado (Usuario Estándar)</option>
                            <option value="admin">Administrador (Acceso Total)</option>
                        </select>
                    </div>

                    {error && <p className="text-red-500 text-sm">{error}</p>}

                    <div className="flex justify-end space-x-3 mt-6">
                        <button type="button" onClick={onClose} disabled={loading}
                            className="px-4 py-2 text-gray-600 bg-gray-200 rounded-lg hover:bg-gray-300">
                            Cancelar
                        </button>
                        <button type="submit" disabled={loading}
                            className="flex items-center space-x-2 px-4 py-2 bg-indigo-600 text-white font-semibold rounded-lg hover:bg-indigo-700 transition duration-150">
                            <FaSave />
                            <span>{loading ? 'Creando...' : 'Crear Usuario'}</span>
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default UserFormModal;