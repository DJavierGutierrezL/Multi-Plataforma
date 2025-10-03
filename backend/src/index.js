require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();

// --- CONFIGURACIÓN DE CORS (LA SOLUCIÓN) ---
// Se define explícitamente que la URL de tu frontend tiene permiso.
const corsOptions = {
  origin: 'https://multi-plataforma.onrender.com',
  optionsSuccessStatus: 200 // Para compatibilidad con navegadores antiguos
};

// Se aplica la configuración de CORS a la aplicación
app.use(cors(corsOptions));

app.use(express.json());

// --- 1. Rutas de la API (Primero) ---
// Se definen antes que los archivos estáticos para que siempre tengan prioridad.
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
apiRouter.use('/inventory', require('./routes/inventoryRoutes'));


// --- 2. Sirve los archivos estáticos de React (Después de la API) ---
const buildPath = path.join(__dirname, '../../frontend/build');
app.use(express.static(buildPath));


// --- 3. Ruta "Catch-all" con Expresión Regular (Al final) ---
// Esta expresión regular captura cualquier ruta GET que NO comience con /api.
app.get(/^(?!\/api).*/, (req, res) => {
  res.sendFile(path.join(buildPath, 'index.html'));
});


const PORT = process.env.PORT || 3001;
const HOST = '0.0.0.0';

app.listen(PORT, HOST, () => {
  console.log(`Servidor API escuchando en el puerto ${PORT}`);
});

