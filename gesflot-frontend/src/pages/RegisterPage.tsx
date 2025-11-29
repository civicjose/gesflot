import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import { FaUserPlus } from 'react-icons/fa';

const RegisterPage: React.FC = () => {
    // Guardo los datos del formulario aquí
    const [datos, setDatos] = useState({
        name: '',
        email: '',
        password: '',
        confirmPassword: ''
    });
    const [error, setError] = useState('');
    const [cargando, setCargando] = useState(false);
    
    const navigate = useNavigate();

    // Actualizo el estado cuando el usuario escribe
    const manejarCambio = (e: React.ChangeEvent<HTMLInputElement>) => {
        setDatos({ ...datos, [e.target.name]: e.target.value });
    };

    const registrarse = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setCargando(true);

        // Validaciones básicas
        if (datos.password !== datos.confirmPassword) {
            setError('Las contraseñas no coinciden.');
            setCargando(false);
            return;
        }

        if (datos.password.length < 6) {
            setError('La contraseña es demasiado corta (mínimo 6 letras).');
            setCargando(false);
            return;
        }

        try {
            // Registro al usuario con rol de empleado por defecto
            await axios.post('/api/auth/register', {
                name: datos.name,
                email: datos.email,
                password: datos.password,
                role: 'employee' 
            });

            alert('Cuenta creada correctamente. Ya puedes entrar.');
            navigate('/login');

        } catch (err: any) {
            setError(err.response?.data?.message || 'Error al intentar registrarse.');
        } finally {
            setCargando(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-slate-50 font-sans">
            <div className="bg-white p-8 rounded-xl shadow-sm border border-slate-200 w-full max-w-md">
                
                <div className="text-center mb-8">
                    <div className="bg-indigo-50 text-indigo-600 p-3 rounded-full inline-block mb-3">
                        <FaUserPlus size={22} />
                    </div>
                    <h2 className="text-2xl font-bold text-slate-800">Crear cuenta nueva</h2>
                    <p className="text-slate-500 text-sm mt-1">Únete para empezar a reservar vehículos</p>
                </div>
                
                <form onSubmit={registrarse} className="space-y-4">
                    <div>
                        <label className="block text-slate-700 text-sm font-bold mb-1">Nombre completo</label>
                        <input
                            type="text"
                            name="name"
                            value={datos.name}
                            onChange={manejarCambio}
                            className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition bg-slate-50 focus:bg-white"
                            placeholder="Ej. Laura Martínez"
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-slate-700 text-sm font-bold mb-1">Correo electrónico</label>
                        <input
                            type="email"
                            name="email"
                            value={datos.email}
                            onChange={manejarCambio}
                            className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition bg-slate-50 focus:bg-white"
                            placeholder="tu@email.com"
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-slate-700 text-sm font-bold mb-1">Contraseña</label>
                        <input
                            type="password"
                            name="password"
                            value={datos.password}
                            onChange={manejarCambio}
                            className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition bg-slate-50 focus:bg-white"
                            placeholder="••••••••"
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-slate-700 text-sm font-bold mb-1">Repetir contraseña</label>
                        <input
                            type="password"
                            name="confirmPassword"
                            value={datos.confirmPassword}
                            onChange={manejarCambio}
                            className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition bg-slate-50 focus:bg-white"
                            placeholder="••••••••"
                            required
                        />
                    </div>

                    {error && (
                        <div className="bg-red-50 text-red-600 text-sm p-3 rounded-lg border border-red-100 text-center">
                            {error}
                        </div>
                    )}

                    <button
                        type="submit"
                        disabled={cargando}
                        className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-4 rounded-lg transition duration-200 shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {cargando ? 'Creando cuenta...' : 'Registrarse'}
                    </button>
                </form>

                <div className="mt-8 text-center pt-6 border-t border-slate-100">
                    <p className="text-sm text-slate-500">
                        ¿Ya tienes usuario?{' '}
                        <Link to="/login" className="text-indigo-600 hover:text-indigo-800 font-semibold transition">
                            Entra aquí
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default RegisterPage;