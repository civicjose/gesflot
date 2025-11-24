import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import axios from 'axios';

// --- Definición de Tipos ---
interface User {
    id: number;
    name: string;
    role: 'employee' | 'admin';
}

interface AuthContextType {
    user: User | null;
    token: string | null;
    login: (token: string, userData: User) => void;
    logout: () => void;
    isAdmin: boolean;
}

// Función auxiliar para configurar el header de Axios
const setAuthHeader = (token: string | null) => {
    if (token) {
        axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    } else {
        delete axios.defaults.headers.common['Authorization'];
    }
}

// 1. Crear el contexto
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// 2. Proveedor de Contexto (Guarda datos en LocalStorage)
export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
    
    // --- 🚨 CORRECCIÓN CLAVE: Configurar el header inmediatamente 🚨 ---
    const [token, setToken] = useState<string | null>(() => {
        const storedToken = localStorage.getItem('token');
        setAuthHeader(storedToken); // Configurar el header ANTES de que el componente monte completamente
        return storedToken;
    });

    const [user, setUser] = useState<User | null>(() => {
        const storedUser = localStorage.getItem('user');
        return storedUser ? JSON.parse(storedUser) : null;
    });
    // ------------------------------------------------------------------

    useEffect(() => {
        // Este useEffect maneja los cambios de token DESPUÉS del montaje (login, logout)
        setAuthHeader(token);
    }, [token]);

    const login = (newToken: string, userData: User) => {
        localStorage.setItem('token', newToken);
        localStorage.setItem('user', JSON.stringify(userData));
        setToken(newToken);
        setUser(userData);
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

// 3. Hook para consumir el contexto
export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth debe ser usado dentro de un AuthProvider');
    }
    return context;
};