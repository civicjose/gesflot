import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FaTimes, FaSave, FaSync } from 'react-icons/fa';

// Tipo de dato
interface Vehiculo {
    id?: number;
    make: string;
    model: string;
    license_plate: string;
    mileage: number;
    status: 'available' | 'in_use' | 'maintenance';
}

interface ModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
    initialData: Vehiculo | null; // Si viene null es crear, si no es editar
}

const VehicleFormModal: React.FC<ModalProps> = ({ isOpen, onClose, onSuccess, initialData }) => {
    const [datos, setDatos] = useState<Vehiculo>({
        make: '', model: '', license_plate: '', mileage: 0, status: 'available',
    });
    const [cargando, setCargando] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        if (initialData) {
            setDatos(initialData);
        } else {
            // Limpio el formulario
            setDatos({ make: '', model: '', license_plate: '', mileage: 0, status: 'available' });
        }
    }, [initialData]);

    if (!isOpen) return null;

    const manejarCambio = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setDatos(prev => ({ ...prev, [name]: name === 'mileage' ? Number(value) : value }));
    };

    const manejarEnvio = async (e: React.FormEvent) => {
        e.preventDefault();
        setCargando(true);
        setError('');

        const esEdicion = !!initialData?.id;
        const url = esEdicion ? `/api/vehicles/${initialData?.id}` : '/api/vehicles';
        const metodo = esEdicion ? axios.put : axios.post;

        try {
            await metodo(url, datos);
            onSuccess();
            onClose();
        } catch (err: any) {
            setError(err.response?.data?.message || `Error al ${esEdicion ? 'actualizar' : 'guardar'}.`);
        } finally {
            setCargando(false);
        }
    };

    const esEdicion = !!initialData?.id;

    return (
        <div className="fixed inset-0 bg-gray-900 bg-opacity-75 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg">
                <div className={`flex justify-between items-center p-6 border-b border-gray-200 rounded-t-xl ${esEdicion ? 'bg-indigo-700' : 'bg-indigo-600'}`}>
                    <h3 className="text-xl font-bold text-white">
                        {esEdicion ? 'Editar vehículo' : 'Añadir a la flota'}
                    </h3>
                    <button onClick={onClose} className="text-white hover:text-indigo-200 transition">
                        <FaTimes size={20} />
                    </button>
                </div>

                <form onSubmit={manejarEnvio} className="p-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        <div className="col-span-1">
                            <label className="block text-sm font-medium text-gray-700 mb-1">Marca</label>
                            <input type="text" name="make" value={datos.make} onChange={manejarCambio} required
                                className="w-full p-2 border border-gray-300 rounded-lg" />
                        </div>
                        <div className="col-span-1">
                            <label className="block text-sm font-medium text-gray-700 mb-1">Modelo</label>
                            <input type="text" name="model" value={datos.model} onChange={manejarCambio} required
                                className="w-full p-2 border border-gray-300 rounded-lg" />
                        </div>
                        <div className="col-span-1">
                            <label className="block text-sm font-medium text-gray-700 mb-1">Matrícula</label>
                            <input type="text" name="license_plate" value={datos.license_plate} onChange={manejarCambio} required
                                disabled={esEdicion} // No dejamos cambiar matrícula al editar
                                className={`w-full p-2 border border-gray-300 rounded-lg ${esEdicion ? 'bg-gray-100' : ''}`} />
                        </div>
                        <div className="col-span-1">
                            <label className="block text-sm font-medium text-gray-700 mb-1">Kilómetros</label>
                            <input type="number" name="mileage" value={datos.mileage} onChange={manejarCambio} required
                                className="w-full p-2 border border-gray-300 rounded-lg" />
                        </div>
                        
                        <div className="col-span-2">
                            <label className="block text-sm font-medium text-gray-700 mb-1">Estado actual</label>
                            <select name="status" value={datos.status} onChange={manejarCambio} required
                                className="w-full p-2 border border-gray-300 rounded-lg bg-white">
                                <option value="available">Disponible</option>
                                <option value="in_use">En uso</option>
                                <option value="maintenance">En taller</option>
                            </select>
                        </div>
                    </div>
                    
                    {error && <p className="text-red-500 text-sm mb-4">{error}</p>}
                    
                    <div className="flex justify-end space-x-3 mt-4">
                        <button type="button" onClick={onClose} disabled={cargando}
                            className="px-4 py-2 text-gray-600 bg-gray-200 rounded-lg hover:bg-gray-300">
                            Cancelar
                        </button>
                        <button type="submit" disabled={cargando}
                            className={`flex items-center space-x-2 px-4 py-2 text-white font-semibold rounded-lg ${esEdicion ? 'bg-indigo-700' : 'bg-indigo-600'} hover:opacity-90`}>
                            {esEdicion ? <FaSync /> : <FaSave />}
                            <span>{cargando ? 'Guardando...' : (esEdicion ? 'Actualizar' : 'Guardar')}</span>
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default VehicleFormModal;