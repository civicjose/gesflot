import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
// Importamos los estilos globales donde pondremos las animaciones
import './index.css';
import { AuthProvider } from './context/AuthContext';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    {/* Englobamos toda la app en el AuthProvider para gestionar la sesión */}
    <AuthProvider> 
      <App />
    </AuthProvider>
  </React.StrictMode>,
);