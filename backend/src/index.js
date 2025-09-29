require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());

// --- MODIFICACIÓN 1: Servir archivos estáticos de React ---
// Le decimos a Express que sirva los archivos del frontend desde la carpeta 'dist'
// IMPORTANTE: Esta ruta asume que tienes una carpeta 'frontend' y 'backend' al mismo nivel.
// Ejemplo: /Multi-Plataforma/frontend/dist
app.use(express.static(path.join(__dirname, '../../frontend/dist')));


// --- Centralizamos todas las rutas de la API bajo /api ---
const apiRouter = express.Router();
app.use('/api', apiRouter);


// --- Conectamos TODAS las rutas al apiRouter ---
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


// --- MODIFICACIÓN 2: Manejador "Catch-All" con Regex (Solución Definitiva) ---
// Esto captura cualquier ruta que NO comience con /api y le sirve tu app de React.
// Debe ir al FINAL, después de todas las rutas de API.
app.get(/^(?!\/api).*/, (req, res) => {
  res.sendFile(path.join(__dirname, '../../frontend/dist', 'index.html'));
});


// --- Iniciar el servidor ---
const PORT = process.env.PORT || 3001;

app.listen(PORT, () => {
  console.log(`Servidor escuchando en el puerto ${PORT}`);
});

