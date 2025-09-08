import express from "express";
import pkg from "pg";
import cors from "cors";
import { ensureDatabase } from "./setup_db.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const { Pool } = pkg;
const app = express();

app.use(cors());
app.use(express.json());

// Conexión a PostgreSQL usando DATABASE_URL
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === "production" ? { rejectUnauthorized: false } : false
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

// ------------------- LOGIN -------------------
app.post("/api/auth/login", async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: "Correo y contraseña son requeridos" });
  }

  try {
    const result = await pool.query(
      'SELECT * FROM "user" WHERE email=$1',
      [email]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({ error: "Usuario no encontrado" });
    }

    const user = result.rows[0];

    // Verificar contraseña
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ error: "Contraseña incorrecta" });
    }

    // Generar token JWT
    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET || "default_secret",
      { expiresIn: "12h" }
    );

    // Devolver datos
    res.json({
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      token,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error interno del servidor" });
  }
});

// ------------------- CRUD CLIENTES -------------------
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

// ------------------- LEVANTAR SERVIDOR -------------------
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Servidor corriendo en puerto ${PORT}`);
});
