import React from 'react';
import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import LoginPage from './pages/LoginPage';
import AdminDashboard from './pages/AdminDashboard';
import EmployeeDashboard from './pages/EmployeeDashboard';
import RegisterPage from './pages/RegisterPage';

// Protejo las rutas que necesitan login
const RutaProtegida: React.FC = () => {
  const { token } = useAuth();
  return token ? <Outlet /> : <Navigate to="/login" replace />;
};

// Protejo las rutas de admin
const RutaAdmin: React.FC = () => {
  const { token, isAdmin } = useAuth();
  return token && isAdmin ? <Outlet /> : <Navigate to="/" replace />; 
};

const App: React.FC = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />

        <Route element={<RutaProtegida />}>
          {/* Dashboard del empleado (Home) */}
          <Route path="/" element={<EmployeeDashboard />} />
          
          <Route element={<RutaAdmin />}>
            <Route path="/admin" element={<AdminDashboard />} />
          </Route>
        </Route>

        {/* Si pone cualquier cosa rara, al home */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
};

export default App;