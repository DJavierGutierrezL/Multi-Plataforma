require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path'); // <-- MODIFICACIÓN 1: Importamos el módulo 'path' de Node.js

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());

// --- MODIFICACIÓN 2: Servir archivos estáticos de React ---
// Esta línea le dice a Express que, para cualquier petición, primero busque si existe
// un archivo correspondiente en la carpeta de build del frontend.
// AJUSTA ESTA RUTA si tu estructura de carpetas es diferente.
// Esta ruta asume que tu backend está en una carpeta y tu frontend en otra al mismo nivel.
app.use(express.static(path.join(__dirname, '../frontend/dist')));


// --- Centralizamos todas las rutas de la API bajo /api ---
// Todas las peticiones que empiecen con /api serán manejadas por el apiRouter.
const apiRouter = express.Router();
app.use('/api', apiRouter);


// --- Conectamos TODAS las rutas al apiRouter ---
// (Tu código original de rutas permanece igual)
const authRoutes = require('./routes/authRoutes');
apiRouter.use('/auth', authRoutes);

const businessRoutes = require('./routes/businessRoutes');
apiRouter.use('/businesses', businessRoutes);

const adminRoutes = require('./routes/adminRoutes');
apiRouter.use('/admin', adminRoutes);

const userRoutes = require('./routes/userRoutes');
apiRouter.use('/users', userRoutes);

const planRoutes = require('./routes/planRoutes');
apiRouter.use('/plans', planRoutes);

const subscriptionRoutes = require('./routes/subscriptionRoutes');
apiRouter.use('/subscriptions', subscriptionRoutes);

const clientRoutes = require('./routes/clientRoutes');
apiRouter.use('/clients', clientRoutes);

const serviceRoutes = require('./routes/serviceRoutes');
apiRouter.use('/services', serviceRoutes);

const appointmentRoutes = require('./routes/appointmentRoutes');
apiRouter.use('/appointments', appointmentRoutes);

const aiRoutes = require('./routes/aiRoutes');
apiRouter.use('/ai', aiRoutes);


// --- MODIFICACIÓN 3: Manejador "Catch-All" para el Frontend ---
// Esta ruta debe ir DESPUÉS de todas tus rutas de API.
// Captura cualquier petición GET que no haya coincidido con las rutas de la API
// y le envía el archivo principal de tu aplicación de React.
// Esto es esencial para que el enrutador de React (React Router) funcione.
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/dist', 'index.html'));
});


// --- Iniciar el servidor ---
const PORT = process.env.PORT || 3001;

app.listen(PORT, () => {
  console.log(`Servidor escuchando en el puerto ${PORT}`);
});
