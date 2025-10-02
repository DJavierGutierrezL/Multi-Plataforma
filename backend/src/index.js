require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path'); // Importa el módulo path

const app = express();

app.use(cors());
app.use(express.json());

// --- Sirve los archivos estáticos de la aplicación de React ---
// La ruta se ajustó para salir de 'src' y 'backend' y luego entrar a 'frontend/build'
const buildPath = path.join(__dirname, '../../frontend/build');
app.use(express.static(buildPath));

// --- Rutas de la API ---
const apiRouter = express.Router();
app.use('/api', apiRouter);

// Conectamos todas tus rutas de API
apiRouter.use('/auth', require('./routes/authRoutes'));
apiRouter.use('/businesses', require('./routes/businessRoutes'));
apiRouter.use('/admin', require('./routes/adminRoutes'));
apiRouter.use('/users', require('./routes/userRoutes'));
apiRouter.use('/plans', require('./routes/planRoutes'));
apiRouter.use('/subscriptions', require('./routes/subscriptionRoutes'));
apiRouter.use('/clients', require('./routes/clientRoutes'));
apiRouter.use('/services', require('./routes/serviceRoutes'));
apiRouter.use('/appointments', require('./routes/appointmentRoutes'));
apiRouter.use('/ai', require('./routes/aiRoutes'));

// --- Ruta "Catch-all" ---
// Si la petición no es para la API, envía la página de React
app.get('*', (req, res) => {
  res.sendFile(path.join(buildPath, 'index.html'));
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Servidor API escuchando en el puerto ${PORT}`);
});