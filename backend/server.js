import express from "express";
import pkg from "pg";
import cors from "cors";
import { ensureDatabase } from "./setup_db.js"; // 👈 importar migraciones

const { Pool } = pkg;

const app = express();
app.use(cors());
app.use(express.json());

// Conexión a PostgreSQL usando DATABASE_URL
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
});

// Ejecutar migraciones si RUN_MIGRATIONS=true
if (process.env.RUN_MIGRATIONS === "true") {
  ensureDatabase()
    .then(() => console.log("✅ Migraciones ejecutadas con éxito"))
    .catch((err) => console.error("❌ Error ejecutando migraciones:", err));
}

// Endpoint de prueba
app.get("/", (req, res) => {
  res.send("Backend funcionando 🚀");
});

// CRUD clientes
app.get("/clientes", async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM clientes");
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post("/clientes", async (req, res) => {
  const { documento, nombres, apellidos, telefono, correo } = req.body;
  try {
    const result = await pool.query(
      "INSERT INTO clientes (documento, nombres, apellidos, telefono, correo) VALUES ($1, $2, $3, $4, $5) RETURNING *",
      [documento, nombres, apellidos, telefono, correo]
    );
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.put("/clientes/:id", async (req, res) => {
  const { id } = req.params;
  const { documento, nombres, apellidos, telefono, correo } = req.body;
  try {
    const result = await pool.query(
      "UPDATE clientes SET documento=$1, nombres=$2, apellidos=$3, telefono=$4, correo=$5 WHERE id=$6 RETURNING *",
      [documento, nombres, apellidos, telefono, correo, id]
    );
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete("/clientes/:id", async (req, res) => {
  const { id } = req.params;
  try {
    await pool.query("DELETE FROM clientes WHERE id=$1", [id]);
    res.json({ message: "Cliente eliminado" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Levantar servidor
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Servidor corriendo en puerto ${PORT}`);
});
