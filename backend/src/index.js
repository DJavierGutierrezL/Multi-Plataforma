require('dotenv').config();
const express = require('express');
const cors = require('cors'); // <-- CORRECCIÓN #1: Importar el paquete correctamente.

const app = express();

// Middlewares
app.use(cors());         // Ahora esto funcionará y habilitará CORS.
app.use(express.json());

// Ruta de prueba
app.get('/', (req, res) => {
  res.send('¡El backend de Kandy AI está funcionando! 🚀');
});

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
apiRouter.use('/clients', clientRoutes); // <-- CORRECCIÓN #2: Usando apiRouter.

const serviceRoutes = require('./routes/serviceRoutes');
apiRouter.use('/services', serviceRoutes); // <-- CORRECCIÓN #2: Usando apiRouter.

const appointmentRoutes = require('./routes/appointmentRoutes');
apiRouter.use('/appointments', appointmentRoutes); // <-- CORRECCIÓN #2: Usando apiRouter.

const aiRoutes = require('./routes/aiRoutes');
apiRouter.use('/ai', aiRoutes); // <-- CORRECCIÓN #2: Usando apiRouter.


// --- Iniciar el servidor ---
const PORT = process.env.PORT || 3001;

app.listen(PORT, () => {
  console.log(`Servidor escuchando en el puerto ${PORT}`);
});