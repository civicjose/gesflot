import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FaTimes, FaSave, FaSync } from 'react-icons/fa';

// Nuevo tipo para los datos iniciales (puede ser nulo si es una creación)
interface Vehicle {
    id?: number;
    make: string;
    model: string;
    license_plate: string;
    mileage: number;
    status: 'available' | 'in_use' | 'maintenance';
}

interface VehicleFormModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void; // Función para recargar la lista
    initialData: Vehicle | null; // Datos del vehículo a editar (o null para crear)
}

const VehicleFormModal: React.FC<VehicleFormModalProps> = ({ isOpen, onClose, onSuccess, initialData }) => {
    const [formData, setFormData] = useState<Vehicle>({
        make: '', model: '', license_plate: '', mileage: 0, status: 'available',
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    // useEffect para cargar los datos si estamos en modo edición
    useEffect(() => {
        if (initialData) {
            setFormData(initialData);
        } else {
            // Resetear el formulario si es una creación
            setFormData({ make: '', model: '', license_plate: '', mileage: 0, status: 'available' });
        }
    }, [initialData]);

    if (!isOpen) return null;

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: name === 'mileage' ? Number(value) : value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        const isEditing = !!initialData?.id;
        const url = isEditing ? `/api/vehicles/${initialData?.id}` : '/api/vehicles';
        const method = isEditing ? axios.put : axios.post;

        try {
            await method(url, formData);
            
            onSuccess();
            onClose();
        } catch (err: any) {
            const message = err.response?.data?.message || `Error al ${isEditing ? 'actualizar' : 'guardar'}. Revise los datos.`;
            setError(message);
        } finally {
            setLoading(false);
        }
    };

    const isEditing = !!initialData?.id;

    // Estilos para el fondo oscuro y el modal
    return (
        <div className="fixed inset-0 bg-gray-900 bg-opacity-75 flex items-center justify-center z-50 p-4 transition-opacity duration-300">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg transition-transform duration-300 transform scale-100">
                
                {/* Cabecera del Modal */}
                <div className={`flex justify-between items-center p-6 border-b border-gray-200 rounded-t-xl ${isEditing ? 'bg-indigo-700' : 'bg-indigo-600'}`}>
                    <h3 className="text-xl font-bold text-white">
                        {isEditing ? 'Editar Vehículo' : 'Añadir Vehículo a la Flota'}
                    </h3>
                    <button onClick={onClose} className="text-white hover:text-indigo-200 transition">
                        <FaTimes size={20} />
                    </button>
                </div>

                {/* Cuerpo del Formulario */}
                <form onSubmit={handleSubmit} className="p-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        {/* Marca, Modelo, Matrícula, Kilometraje y Estado... */}
                        {['make', 'model', 'license_plate', 'mileage'].map((field) => (
                            <div key={field} className="col-span-1">
                                <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor={field}>
                                    {field.charAt(0).toUpperCase() + field.slice(1).replace('_', ' ')}
                                </label>
                                <input 
                                    type={field === 'mileage' ? 'number' : 'text'} 
                                    id={field} 
                                    name={field} 
                                    value={formData[field as keyof Vehicle] as string | number} 
                                    onChange={handleChange} 
                                    required
                                    // Desactivar edición de matrícula si ya existe para evitar errores de duplicidad.
                                    disabled={isEditing && field === 'license_plate'} 
                                    className={`w-full p-2 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500 ${isEditing && field === 'license_plate' ? 'bg-gray-100' : ''}`} 
                                />
                            </div>
                        ))}
                        
                        {/* Estado (Ocupa dos columnas) */}
                        <div className="col-span-2">
                            <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="status">Estado</label>
                            <select id="status" name="status" value={formData.status} onChange={handleChange} required
                                className="w-full p-2 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500 bg-white">
                                <option value="available">Disponible</option>
                                <option value="in_use">En Uso</option>
                                <option value="maintenance">Mantenimiento</option>
                            </select>
                        </div>
                    </div>
                    
                    {error && <p className="text-red-500 text-sm mb-4">{error}</p>}
                    
                    {/* Pie del Modal (Acciones) */}
                    <div className="flex justify-end space-x-3 mt-4">
                        <button type="button" onClick={onClose} disabled={loading}
                            className="px-4 py-2 text-gray-600 bg-gray-200 rounded-lg hover:bg-gray-300 transition duration-150 disabled:opacity-50">
                            Cancelar
                        </button>
                        <button type="submit" disabled={loading}
                            className={`flex items-center space-x-2 px-4 py-2 text-white font-semibold rounded-lg transition duration-150 disabled:bg-indigo-400 ${isEditing ? 'bg-indigo-700 hover:bg-indigo-800' : 'bg-indigo-600 hover:bg-indigo-700'}`}>
                            {isEditing ? <FaSync /> : <FaSave />}
                            <span>{loading ? 'Guardando...' : (isEditing ? 'Actualizar Vehículo' : 'Guardar Vehículo')}</span>
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default VehicleFormModal;