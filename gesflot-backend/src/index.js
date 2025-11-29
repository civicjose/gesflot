const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();

// Importar rutas
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const vehicleRoutes = require('./routes/vehicleRoutes');
const reservationRoutes = require('./routes/reservationRoutes');
const documentRoutes = require('./routes/documentRoutes');

// Middlewares
app.use(cors()); // Para que React se conecte sin problemas
app.use(express.json()); // Para leer el JSON que nos manda el frontend

// Ruta base para probar
app.get('/', (req, res) => {
    res.send('API GesFlot funcionando correctamente 🚀');
});

// Conectar las rutas
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/vehicles', vehicleRoutes);
app.use('/api/reservations', reservationRoutes);
app.use('/api/documents', documentRoutes);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Servidor corriendo en http://localhost:${PORT}`);
});