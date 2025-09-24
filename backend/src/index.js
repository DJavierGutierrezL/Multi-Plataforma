require('dotenv').config();
const express = require('express');
const cors = require('cors');

const app = express();

// Middlewares
app.use(cors());
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

// --- INICIO DE LA MODIFICACIÓN ---
// 1. Requerimos el nuevo archivo de rutas de admin
const adminRoutes = require('./routes/adminRoutes');
// 2. Le decimos a la API que use este archivo para todas las rutas que empiecen con /admin
apiRouter.use('/admin', adminRoutes);
// --- FIN DE LA MODIFICACIÓN ---

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


// --- Iniciar el servidor ---
const PORT = process.env.PORT || 3001;

app.listen(PORT, () => {
  console.log(`Servidor escuchando en el puerto ${PORT}`);
});