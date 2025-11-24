import React, { useState } from 'react';
import axios from 'axios';
import { FaTimes, FaSave } from 'react-icons/fa';

interface Vehicle {
    id: number;
    make: string;
    model: string;
    license_plate: string;
}

interface ReservationModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
    availableVehicles: Vehicle[]; // Lista de vehículos disponibles
}

const ReservationModal: React.FC<ReservationModalProps> = ({ isOpen, onClose, onSuccess, availableVehicles }) => {
    // Inicializamos con fecha y hora actuales, formateados para input (YYYY-MM-DDTHH:MM)
    const now = new Date();
    const isoString = now.toISOString().slice(0, 16); // Formato datetime-local

    const [formData, setFormData] = useState({
        vehicle_id: availableVehicles[0]?.id || 0, // Por defecto, el primer vehículo
        start_time: isoString,
        end_time: isoString,
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    if (!isOpen) return null;

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: name === 'vehicle_id' ? Number(value) : value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        // Validación básica de fechas en frontend (el backend valida el solapamiento)
        if (new Date(formData.start_time) >= new Date(formData.end_time)) {
            setError('La fecha de fin debe ser posterior a la fecha de inicio.');
            setLoading(false);
            return;
        }

        try {
            // Llama a la ruta POST /api/reservations (la lógica de solapamiento de fechas se ejecuta en el backend)
            await axios.post('/api/reservations', formData); 
            
            onSuccess();
            onClose();
            // Resetear formulario tras éxito
            setFormData({ vehicle_id: availableVehicles[0]?.id || 0, start_time: isoString, end_time: isoString }); 
        } catch (err: any) {
            // Error 409 (Conflict) del backend si hay overbooking
            const message = err.response?.data?.message || 'Error al solicitar reserva. Verifique fechas.';
            setError(message);
        } finally {
            setLoading(false);
        }
    };

    // Si no hay vehículos disponibles, mostramos un mensaje
    if (availableVehicles.length === 0) {
        return (
             <div className="fixed inset-0 bg-gray-900 bg-opacity-75 flex items-center justify-center z-50 p-4">
                <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg p-6">
                    <h3 className="text-xl font-bold text-red-600 mb-4">No hay Vehículos Disponibles</h3>
                    <p>No se encontraron vehículos en la flota para reservar. Contacte al administrador.</p>
                     <button onClick={onClose} className="mt-4 px-4 py-2 bg-gray-200 rounded-lg">Cerrar</button>
                </div>
            </div>
        );
    }


    return (
        <div className="fixed inset-0 bg-gray-900 bg-opacity-75 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg transition-transform duration-300 transform scale-100">
                
                {/* Cabecera del Modal */}
                <div className="flex justify-between items-center p-6 border-b border-gray-200 bg-indigo-600 rounded-t-xl">
                    <h3 className="text-xl font-bold text-white">Solicitud de Reserva</h3>
                    <button onClick={onClose} className="text-white hover:text-indigo-200 transition">
                        <FaTimes size={20} />
                    </button>
                </div>

                {/* Cuerpo del Formulario */}
                <form onSubmit={handleSubmit} className="p-6">
                    <div className="space-y-4 mb-4">
                        {/* Vehículo */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="vehicle_id">Seleccionar Vehículo</label>
                            <select id="vehicle_id" name="vehicle_id" value={formData.vehicle_id} onChange={handleChange} required
                                className="w-full p-2 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500 bg-white">
                                {availableVehicles.map(v => (
                                    <option key={v.id} value={v.id}>{v.make} {v.model} ({v.license_plate})</option>
                                ))}
                            </select>
                        </div>
                        {/* Fecha Inicio */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="start_time">Inicio de Reserva</label>
                            <input type="datetime-local" id="start_time" name="start_time" value={formData.start_time} onChange={handleChange} required
                                className="w-full p-2 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500" />
                        </div>
                        {/* Fecha Fin */}
                         <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="end_time">Fin de Reserva</label>
                            <input type="datetime-local" id="end_time" name="end_time" value={formData.end_time} onChange={handleChange} required
                                className="w-full p-2 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500" />
                        </div>
                    </div>
                    
                    {error && <p className="text-red-500 text-sm mb-4">{error}</p>}
                    
                    {/* Pie del Modal (Acciones) */}
                    <div className="flex justify-end mt-4">
                        <button type="submit" disabled={loading}
                            className="flex items-center space-x-2 px-4 py-2 bg-indigo-600 text-white font-semibold rounded-lg hover:bg-indigo-700 transition duration-150 disabled:bg-indigo-400">
                            <FaSave />
                            <span>{loading ? 'Enviando...' : 'Solicitar Reserva'}</span>
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ReservationModal;