import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { FaCar } from 'react-icons/fa';

const LoginPage: React.FC = () => {
    // Estados para el formulario
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    
    const navigate = useNavigate();
    const { login } = useAuth();

    // Función que se ejecuta al pulsar Entrar
    const intentarLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        try {
            // Mando los datos al servidor
            const respuesta = await axios.post('/api/auth/login', { email, password }); 
            
            // Si todo va bien, guardo la sesión
            login(respuesta.data.token, respuesta.data.user);
            
            // Limpio los campos
            setEmail('');
            setPassword(''); 
            
            // Redirijo a la pantalla que toque según el rol
            if (respuesta.data.user.role === 'admin') {
                navigate('/admin', { replace: true });
            } else {
                navigate('/', { replace: true });
            }

        } catch (err: any) {
            // Si falla, muestro el mensaje
            setError(err.response?.data?.message || 'Error al conectar con el servidor.');
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-slate-50 font-sans">
            <div className="bg-white p-8 rounded-xl shadow-sm border border-slate-200 w-full max-w-md">
                
                {/* Logo y Título */}
                <div className="text-center mb-8">
                    <div className="bg-indigo-600 text-white p-3 rounded-lg inline-block mb-3 shadow-md shadow-indigo-200">
                        <FaCar size={24} />
                    </div>
                    <h2 className="text-2xl font-bold text-slate-800">Bienvenido a GesFlot</h2>
                    <p className="text-slate-500 text-sm mt-1">Inicia sesión para gestionar tus reservas</p>
                </div>

                <form onSubmit={intentarLogin} className="space-y-5">
                    <div>
                        <label className="block text-slate-700 text-sm font-bold mb-1" htmlFor="email">Correo electrónico</label>
                        <input
                            type="email"
                            id="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition bg-slate-50 focus:bg-white"
                            placeholder="ejemplo@empresa.com"
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-slate-700 text-sm font-bold mb-1" htmlFor="password">Contraseña</label>
                        <input
                            type="password"
                            id="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
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
                        className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-4 rounded-lg transition duration-200 shadow-sm"
                    >
                        Iniciar sesión
                    </button>
                </form>

                <div className="mt-8 text-center pt-6 border-t border-slate-100">
                    <p className="text-sm text-slate-500">
                        ¿Aún no tienes cuenta?{' '}
                        <Link to="/register" className="text-indigo-600 hover:text-indigo-800 font-semibold transition">
                            Regístrate aquí
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default LoginPage;