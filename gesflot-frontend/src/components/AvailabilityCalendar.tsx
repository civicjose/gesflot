import React, { useState, useMemo } from 'react';
import { FaChevronLeft, FaChevronRight, FaCircle } from 'react-icons/fa';

interface Reserva {
    id: number;
    start_time: string;
    end_time: string;
    status: string;
    make?: string;
    model?: string;
    license_plate?: string;
}

interface CalendarProps {
    reservas: Reserva[];
}

const AvailabilityCalendar: React.FC<CalendarProps> = ({ reservas }) => {
    const [fechaActual, setFechaActual] = useState(new Date());

    const diasDelMes = useMemo(() => {
        const anyo = fechaActual.getFullYear();
        const mes = fechaActual.getMonth();
        const fecha = new Date(anyo, mes, 1);
        const dias = [];
        
        while (fecha.getMonth() === mes) {
            dias.push(new Date(fecha));
            fecha.setDate(fecha.getDate() + 1);
        }
        return dias;
    }, [fechaActual]);

    const cambiarMes = (offset: number) => {
        const nuevaFecha = new Date(fechaActual.setMonth(fechaActual.getMonth() + offset));
        setFechaActual(new Date(nuevaFecha));
    };

    const obtenerReservasDelDia = (fecha: Date) => {
        return reservas.filter(res => {
            const inicio = new Date(res.start_time);
            const fin = new Date(res.end_time);
            
            const check = new Date(fecha.getFullYear(), fecha.getMonth(), fecha.getDate());
            const resInicio = new Date(inicio.getFullYear(), inicio.getMonth(), inicio.getDate());
            const resFin = new Date(fin.getFullYear(), fin.getMonth(), fin.getDate());
            
            return (res.status === 'approved' || res.status === 'pending') && 
                   check >= resInicio && check <= resFin;
        });
    };

    const nombreMes = fechaActual.toLocaleString('es-ES', { month: 'long', year: 'numeric' });

    // Empezar semana en lunes
    const primerDiaSemana = (diasDelMes[0].getDay() + 6) % 7;

    return (
        <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
            <div className="bg-indigo-600 p-4 flex justify-between items-center text-white">
                <button onClick={() => cambiarMes(-1)} className="p-2 hover:bg-indigo-700 rounded-full transition"><FaChevronLeft /></button>
                <h3 className="text-xl font-bold capitalize">{nombreMes}</h3>
                <button onClick={() => cambiarMes(1)} className="p-2 hover:bg-indigo-700 rounded-full transition"><FaChevronRight /></button>
            </div>

            <div className="grid grid-cols-7 gap-px bg-gray-200">
                {['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'].map(d => (
                    <div key={d} className="bg-gray-50 p-2 text-center text-xs font-bold text-gray-500 uppercase">{d}</div>
                ))}
                
                {Array.from({ length: primerDiaSemana }).map((_, i) => (
                    <div key={`empty-${i}`} className="bg-white h-24"></div>
                ))}

                {diasDelMes.map(dia => {
                    const reservasDia = obtenerReservasDelDia(dia);
                    const esHoy = dia.toDateString() === new Date().toDateString();

                    return (
                        <div key={dia.toISOString()} className={`bg-white h-24 p-2 border-t border-gray-100 hover:bg-gray-50 transition relative ${esHoy ? 'bg-indigo-50' : ''}`}>
                            <span className={`text-sm font-semibold ${esHoy ? 'text-indigo-600' : 'text-gray-700'}`}>
                                {dia.getDate()}
                            </span>
                            
                            <div className="mt-1 space-y-1 overflow-y-auto max-h-16 no-scrollbar">
                                {reservasDia.map((res, idx) => (
                                    <div 
                                        key={idx} 
                                        className={`text-xs px-1 py-0.5 rounded truncate flex items-center gap-1 cursor-help ${
                                            res.status === 'approved' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                                        }`}
                                        // Tooltip nativo al pasar el ratón
                                        title={`${res.make} ${res.model} - ${res.license_plate}`} 
                                    >
                                        <FaCircle size={6} className="flex-shrink-0" />
                                        {/* AHORA MOSTRAMOS TODO: Marca Modelo (Matrícula) */}
                                        <span className="truncate font-medium">
                                            {res.make ? `${res.make} ${res.model} (${res.license_plate})` : 'Ocupado'}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    );
                })}
            </div>
            
            <div className="p-3 bg-gray-50 text-xs text-gray-500 flex gap-4">
                <div className="flex items-center gap-1"><FaCircle className="text-green-500" /> Aprobada</div>
                <div className="flex items-center gap-1"><FaCircle className="text-yellow-500" /> Pendiente</div>
            </div>
        </div>
    );
};

export default AvailabilityCalendar;