require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());

// --- MODIFICACIÓN: CORREGIR RUTA A ARCHIVOS ESTÁTICOS ---
// Ajustamos la ruta para que coincida con la estructura de carpetas de Render.
// Cambiamos de '../../' a '../../../' para subir un nivel más.
app.use(express.static(path.join(__dirname, '../../../frontend/dist')));


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


// --- MODIFICACIÓN: CORREGIR RUTA EN "CATCH-ALL" ---
// Ajustamos también esta ruta para que apunte al 'index.html' correcto.
app.get(/^(?!\/api).*/, (req, res) => {
  res.sendFile(path.join(__dirname, '../../../frontend/dist', 'index.html'));
});


// --- Iniciar el servidor ---
const PORT = process.env.PORT || 3001;

app.listen(PORT, () => {
  console.log(`Servidor escuchando en el puerto ${PORT}`);
});
