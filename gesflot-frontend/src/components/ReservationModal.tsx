import React, { useState } from 'react';
import axios from 'axios';
import { FaTimes, FaSave, FaExclamationCircle } from 'react-icons/fa';

// Uso la misma interfaz que en otros lados
interface Vehiculo {
    id: number;
    make: string;
    model: string;
    license_plate: string;
}

interface ModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
    availableVehicles: Vehiculo[];
}

const ReservationModal: React.FC<ModalProps> = ({ isOpen, onClose, onSuccess, availableVehicles }) => {
    // Pongo la fecha de hoy formateada para que el input no se queje
    const ahora = new Date();
    // Ajuste pequeño: sumo 1 hora para que el inicio por defecto no sea ya pasado si tardas en rellenar
    ahora.setHours(ahora.getHours() + 1);
    const formatoFecha = ahora.toISOString().slice(0, 16); 

    const [datosForm, setDatosForm] = useState({
        vehicle_id: availableVehicles[0]?.id || 0,
        start_time: formatoFecha,
        end_time: formatoFecha,
    });
    const [enviando, setEnviando] = useState(false);
    const [mensajeError, setMensajeError] = useState('');

    if (!isOpen) return null;

    const manejarCambio = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setDatosForm(prev => ({ ...prev, [name]: name === 'vehicle_id' ? Number(value) : value }));
        // Limpiamos error al intentar cambiar algo
        if (mensajeError) setMensajeError(''); 
    };

    const manejarEnvio = async (e: React.FormEvent) => {
        e.preventDefault();
        setEnviando(true);
        setMensajeError('');

        // Comprobación rápida antes de molestar al servidor
        if (new Date(datosForm.start_time) >= new Date(datosForm.end_time)) {
            setMensajeError('La fecha de fin tiene que ser después de la de inicio.');
            setEnviando(false);
            return;
        }

        try {
            await axios.post('/api/reservations', datosForm); 
            onSuccess();
            onClose();
            // Reseteo el formulario
            setDatosForm({ vehicle_id: availableVehicles[0]?.id || 0, start_time: formatoFecha, end_time: formatoFecha }); 
        } catch (err: any) {
            const msj = err.response?.data?.message || 'Hubo un error al reservar.';
            setMensajeError(msj);
        } finally {
            setEnviando(false);
        }
    };

    if (availableVehicles.length === 0) {
        return (
             <div className="fixed inset-0 bg-gray-900 bg-opacity-75 flex items-center justify-center z-50 p-4">
                <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg p-6 text-center">
                    <FaExclamationCircle className="mx-auto text-red-500 text-5xl mb-4" />
                    <h3 className="text-xl font-bold text-gray-800 mb-2">No hay vehículos</h3>
                    <p className="text-gray-600 mb-6">Ahora mismo no quedan coches disponibles para reservar. Contacta con un administrador.</p>
                     <button onClick={onClose} className="px-6 py-2 bg-gray-200 text-gray-800 font-semibold rounded-lg hover:bg-gray-300 transition">Entendido</button>
                </div>
            </div>
        );
    }

    return (
        <div className="fixed inset-0 bg-gray-900 bg-opacity-75 flex items-center justify-center z-50 p-4 animate-fade-in">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg transition-transform duration-300 transform scale-100 overflow-hidden">
                
                <div className="flex justify-between items-center p-6 border-b border-gray-200 bg-indigo-600">
                    <h3 className="text-xl font-bold text-white">Pedir reserva</h3>
                    <button onClick={onClose} className="text-white hover:text-indigo-200 transition rounded-full p-1 hover:bg-indigo-700">
                        <FaTimes size={20} />
                    </button>
                </div>

                <form onSubmit={manejarEnvio} className="p-6">
                    <div className="space-y-5 mb-6">
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-2" htmlFor="vehicle_id">Elige vehículo</label>
                            <select id="vehicle_id" name="vehicle_id" value={datosForm.vehicle_id} onChange={manejarCambio} required
                                className="w-full p-3 border border-gray-300 rounded-lg bg-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition">
                                {availableVehicles.map(v => (
                                    <option key={v.id} value={v.id}>{v.make} {v.model} ({v.license_plate})</option>
                                ))}
                            </select>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-2" htmlFor="start_time">Desde</label>
                                <input type="datetime-local" id="start_time" name="start_time" value={datosForm.start_time} onChange={manejarCambio} required
                                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition" />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-2" htmlFor="end_time">Hasta</label>
                                <input type="datetime-local" id="end_time" name="end_time" value={datosForm.end_time} onChange={manejarCambio} required
                                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition" />
                            </div>
                        </div>
                    </div>
                    
                    {mensajeError && (
                        <div className="mb-6 bg-red-50 border-l-4 border-red-500 p-4 rounded-md flex items-start gap-3 animate-pulse-slow">
                            <FaExclamationCircle className="text-red-500 text-xl mt-0.5 flex-shrink-0" />
                            <div className="text-sm text-red-700 font-medium">
                                {mensajeError}
                            </div>
                        </div>
                    )}
                    
                    <div className="flex justify-end gap-3 mt-8 p-4 bg-gray-50 -mx-6 -mb-6 border-t">
                        <button type="button" onClick={onClose} disabled={enviando}
                            className="px-5 py-2.5 text-gray-700 bg-white border border-gray-300 rounded-lg font-semibold hover:bg-gray-100 transition">
                            Cancelar
                        </button>
                        <button type="submit" disabled={enviando}
                            className="flex items-center space-x-2 px-5 py-2.5 bg-indigo-600 text-white font-semibold rounded-lg hover:bg-indigo-700 transition duration-150 disabled:bg-indigo-400 shadow-md">
                            <FaSave />
                            <span>{enviando ? 'Enviando solicitud...' : 'Confirmar reserva'}</span>
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ReservationModal;