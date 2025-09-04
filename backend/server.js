import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import authRouter from "./routes/auth.js";
import barberiasRouter from "./routes/barberias.js";
import serviciosRouter from "./routes/servicios.js";
import citasRouter from "./routes/citas.js";
import suscripcionesRouter from "./routes/suscripciones.js";
import { ensureDatabase } from "./setup_db.js";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// Health check
app.get("/health", (_req, res) => res.json({ ok: true }));

// Routers
app.use("/auth", authRouter);
app.use("/barberias", barberiasRouter);
app.use("/servicios", serviciosRouter);
app.use("/citas", citasRouter);
app.use("/suscripciones", suscripcionesRouter);

const port = process.env.PORT || 10000;

const startServer = async () => {
  try {
    if (process.env.RUN_MIGRATIONS === "true") {
      console.log("Running migrations at startup...");
      await ensureDatabase();
      console.log("Database schema ensured.");
    }

    app.listen(port, () => {
      console.log(`Server listening on port ${port}`);
    });

  } catch (err) {
    console.error("Startup error:", err);
    process.exit(1); // Render detectará el fallo
  }
};

// Iniciar servidor
startServer();

