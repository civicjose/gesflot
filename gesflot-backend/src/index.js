const express = require('express');
const cors = require('cors');
require('dotenv').config();
const db = require('./config/db');

const app = express();

const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const vehicleRoutes = require('./routes/vehicleRoutes');
const reservationRoutes = require('./routes/reservationRoutes');
const documentRoutes = require('./routes/documentRoutes');

// --- Middlewares ---
app.use(cors()); // Permite peticiones desde el frontend (React)
app.use(express.json()); // Permite leer JSON en el body de las peticiones

app.get('/', (req, res) => {
    res.send('API GesFlot funcionando correctamente 🚀');
});

app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/vehicles', vehicleRoutes);
app.use('/api/reservations', reservationRoutes);
app.use('/api/documents', documentRoutes);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Servidor corriendo en http://localhost:${PORT}`);
});