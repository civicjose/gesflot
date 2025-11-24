import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { AuthProvider } from './context/AuthContext.tsx'; // Importar el proveedor

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    {/* ¡ESTE WRAPPING ES OBLIGATORIO PARA QUE useAuth FUNCIONE! */}
    <AuthProvider> 
      <App />
    </AuthProvider>
  </React.StrictMode>,
);