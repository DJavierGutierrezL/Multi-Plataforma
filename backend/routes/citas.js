import { Router } from "express";
import { pool } from "../db.js";
import { authRequired } from "../middleware/auth.js";

const router = Router();

// Crear cita
router.post("/", authRequired, async (req, res) => {
  try {
    const { barberia_id, servicio_id, cliente_id, empleado_id, fecha, notas = null } = req.body;
    const estado = "pendiente";
    const { rows } = await pool.query(
      `INSERT INTO citas (barberia_id, servicio_id, cliente_id, empleado_id, fecha, estado, notas)
       VALUES ($1,$2,$3,$4,$5,$6,$7) RETURNING *`,
      [barberia_id, servicio_id, cliente_id, empleado_id, fecha, estado, notas]
    );
    res.status(201).json(rows[0]);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Server error" });
  }
});

// Listar citas por barbería
router.get("/:barberia_id", authRequired, async (req, res) => {
  try {
    const { barberia_id } = req.params;
    const { rows } = await pool.query(
      `SELECT c.*, s.nombre AS servicio_nombre
       FROM citas c
       JOIN servicios s ON s.id = c.servicio_id
       WHERE c.barberia_id = $1
       ORDER BY c.fecha DESC`,
      [barberia_id]
    );
    res.json(rows);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Server error" });
  }
});

export default router;
