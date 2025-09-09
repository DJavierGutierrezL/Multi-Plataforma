import express from "express";
import pg from "pg";
import cors from "cors";
import dotenv from "dotenv";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { ensureDatabase } from "./setup_db.js";

dotenv.config();

const { Pool } = pg;
const app = express();

// Configurar CORS para tu frontend
app.use(cors({
  origin: process.env.FRONTEND_URL || "*",
}));

app.use(express.json());

// Conexión a PostgreSQL
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === "production" ? { rejectUnauthorized: false } : false,
});

// Ejecutar migraciones solo si es necesario
if (process.env.RUN_MIGRATIONS === "true") {
  ensureDatabase()
    .then(async () => {
      console.log("✅ Migraciones ejecutadas con éxito");

      // Crear usuario admin de prueba si no existe
      const email = "admin@multi.com";
      const password = "123456";
      const hashedPassword = await bcrypt.hash(password, 10);

      const existing = await pool.query("SELECT * FROM users WHERE email=$1", [email]);
      if (existing.rows.length === 0) {
        await pool.query(
          "INSERT INTO users (name, email, password, role) VALUES ($1,$2,$3,$4)",
          ["Admin", email, hashedPassword, "admin"]
        );
        console.log("✅ Usuario admin de prueba creado: admin@multi.com / 123456");
      }
    })
    .catch((err) => console.error("❌ Error ejecutando migraciones:", err));
}

// --- Middleware JWT ---
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) return res.status(401).json({ error: "Token no proporcionado" });

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) return res.status(403).json({ error: "Token inválido" });
    req.user = user;
    next();
  });
};

// --- Endpoints ---
app.get("/", (req, res) => res.send("Backend funcionando 🚀"));

// Endpoint de prueba de token
app.get("/api/protected", authenticateToken, (req, res) => {
  res.json({ message: "Acceso autorizado", user: req.user });
});

// --- Auth ---
app.post("/api/auth/login", async (req, res) => {
  const { email, password } = req.body;
  try {
    const result = await pool.query("SELECT * FROM users WHERE email=$1", [email]);
    if (!result.rows.length) return res.status(401).json({ error: "Usuario no encontrado" });

    const user = result.rows[0];
    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) return res.status(401).json({ error: "Contraseña incorrecta" });

    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    res.json({ id: user.id, name: user.name, email: user.email, role: user.role, token });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error interno del servidor" });
  }
});

// --- CRUD Clientes (protegido) ---
app.get("/api/clientes", authenticateToken, async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM clientes");
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error interno del servidor" });
  }
});

app.post("/api/clientes", authenticateToken, async (req, res) => {
  const { documento, nombres, apellidos, telefono, correo } = req.body;
  try {
    const result = await pool.query(
      "INSERT INTO clientes (documento, nombres, apellidos, telefono, correo) VALUES ($1,$2,$3,$4,$5) RETURNING *",
      [documento, nombres, apellidos, telefono, correo]
    );
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error interno del servidor" });
  }
});

app.put("/api/clientes/:id", authenticateToken, async (req, res) => {
  const { id } = req.params;
  const { documento, nombres, apellidos, telefono, correo } = req.body;
  try {
    const result = await pool.query(
      "UPDATE clientes SET documento=$1, nombres=$2, apellidos=$3, telefono=$4, correo=$5 WHERE id=$6 RETURNING *",
      [documento, nombres, apellidos, telefono, correo, id]
    );
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error interno del servidor" });
  }
});

app.delete("/api/clientes/:id", authenticateToken, async (req, res) => {
  const { id } = req.params;
  try {
    await pool.query("DELETE FROM clientes WHERE id=$1", [id]);
    res.json({ message: "Cliente eliminado" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error interno del servidor" });
  }
});

// --- Levantar servidor ---
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Servidor corriendo en puerto ${PORT}`));
