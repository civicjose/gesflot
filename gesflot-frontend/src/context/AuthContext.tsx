import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

interface Usuario {
    id: number;
    name: string;
    role: 'employee' | 'admin';
}

interface ContextType {
    user: Usuario | null;
    token: string | null;
    login: (token: string, datosUsuario: Usuario) => void;
    logout: () => void;
    isAdmin: boolean;
}

const setAuthHeader = (token: string | null) => {
    if (token) {
        axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    } else {
        delete axios.defaults.headers.common['Authorization'];
    }
}

const AuthContext = createContext<ContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
    const [token, setToken] = useState<string | null>(() => {
        const guardado = localStorage.getItem('token');
        setAuthHeader(guardado); 
        return guardado;
    });

    const [user, setUser] = useState<Usuario | null>(() => {
        const guardado = localStorage.getItem('user');
        return guardado ? JSON.parse(guardado) : null;
    });

    useEffect(() => {
        setAuthHeader(token);
    }, [token]);

    const login = (nuevoToken: string, datosUsuario: Usuario) => {
        localStorage.setItem('token', nuevoToken);
        localStorage.setItem('user', JSON.stringify(datosUsuario));
        setToken(nuevoToken);
        setUser(datosUsuario);
    };

    const logout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setToken(null);
        setUser(null);
    };

    const isAdmin = user?.role === 'admin';

    return (
        <AuthContext.Provider value={{ user, token, login, logout, isAdmin }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth debe usarse dentro de AuthProvider');
    }
    return context;
};