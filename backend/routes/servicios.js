import { Router } from "express";
import { pool } from "../db.js";
import { authRequired } from "../middleware/auth.js";

const router = Router();

// Crear servicio
router.post("/", authRequired, async (req, res) => {
  try {
    const { barberia_id, nombre, precio, duracion_min = 30, activo = true } = req.body;
    const { rows } = await pool.query(
      `INSERT INTO servicios (barberia_id, nombre, precio, duracion_min, activo)
       VALUES ($1,$2,$3,$4,$5) RETURNING *`,
      [barberia_id, nombre, precio, duracion_min, activo]
    );
    res.status(201).json(rows[0]);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Server error" });
  }
});

// Listar servicios por barbería
router.get("/:barberia_id", authRequired, async (req, res) => {
  try {
    const { barberia_id } = req.params;
    const { rows } = await pool.query(
      `SELECT * FROM servicios WHERE barberia_id = $1 AND activo = true ORDER BY nombre`,
      [barberia_id]
    );
    res.json(rows);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Server error" });
  }
});

export default router;
