require('dotenv').config();
const express = require('express');
const cors = require('cors');

const app = express();

app.use(cors());
app.use(express.json());

const apiRouter = express.Router();
app.use('/api', apiRouter);

// --- Conectamos todas tus rutas de API ---
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

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Servidor API escuchando en el puerto ${PORT}`);
});

