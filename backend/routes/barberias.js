import { Router } from "express";
import { pool } from "../db.js";
import { authRequired } from "../middleware/auth.js";

const router = Router();

// Crear barbería (solo admin)
router.post("/", authRequired, async (req, res) => {
  try {
    if (req.user.role !== "admin") return res.status(403).json({ error: "Forbidden" });
    const { name, direccion, telefono } = req.body;
    const owner_id = req.user.id;
    const { rows } = await pool.query(
      `INSERT INTO barberias (name, direccion, telefono, owner_id)
       VALUES ($1,$2,$3,$4) RETURNING *`,
      [name, direccion, telefono, owner_id]
    );
    res.status(201).json(rows[0]);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Server error" });
  }
});

// Listar barberías del usuario (owner o asignadas)
router.get("/", authRequired, async (req, res) => {
  try {
    const { rows } = await pool.query(
      `SELECT b.* FROM barberias b
       LEFT JOIN users u ON u.barberia_id = b.id
       WHERE b.owner_id = $1 OR u.id = $1
       GROUP BY b.id`,
      [req.user.id]
    );
    res.json(rows);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Server error" });
  }
});

export default router;
