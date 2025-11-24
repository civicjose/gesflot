// gesflot-vite-frontend/vite.config.ts

import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc' // Importación correcta del plugin

// https://vitejs.dev/config/
export default defineConfig({
  // --- Uso correcto del plugin ---
  plugins: [react()], 
  // ------------------------------
  server: {
    // Configuración del proxy para redirigir peticiones /api/ al backend Node.js (puerto 3000)
    proxy: {
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true,
        secure: false,
      },
    },
    // Puerto de ejecución del Frontend
    port: 5173, 
  }
})