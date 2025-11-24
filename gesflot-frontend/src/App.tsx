import React from 'react';
import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import LoginPage from './pages/LoginPage';
import AdminDashboard from './pages/AdminDashboard';
import EmployeeDashboard from './pages/EmployeeDashboard';
import RegisterPage from './pages/RegisterPage';

// Componente que protege rutas: requiere Token
const ProtectedRoute: React.FC = () => {
  const { token } = useAuth();
  return token ? <Outlet /> : <Navigate to="/login" replace />;
};

// Componente que protege rutas: requiere rol Admin
const AdminRoute: React.FC = () => {
  const { token, isAdmin } = useAuth();
  return token && isAdmin ? <Outlet /> : <Navigate to="/" replace />; 
};

const App: React.FC = () => {
  return (
    <BrowserRouter>
      <Routes>
        {/* Rutas Públicas */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />

        {/* Rutas Protegidas (Requieren Login) */}
        <Route element={<ProtectedRoute />}>
          {/* Dashboard según el rol (Ruta raíz / para empleados) */}
          <Route path="/" element={<EmployeeDashboard />} />
          
          {/* Rutas solo para Administradores */}
          <Route element={<AdminRoute />}>
            <Route path="/admin" element={<AdminDashboard />} />
          </Route>
        </Route>

        {/* Ruta de error/comodín */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
};

export default App;