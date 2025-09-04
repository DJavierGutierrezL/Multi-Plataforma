import { Router } from "express";
import { pool } from "../db.js";
import { authRequired } from "../middleware/auth.js";

const router = Router();

// Crear/actualizar suscripción para una barbería
router.post("/", authRequired, async (req, res) => {
  try {
    if (req.user.role !== "admin") return res.status(403).json({ error: "Forbidden" });
    const { barberia_id, tipo = "paquete", plan_name = null, max_usuarios = 5, fecha_inicio, fecha_fin, estado = "activa" } = req.body;
    const { rows } = await pool.query(
      `INSERT INTO suscripciones (barberia_id, tipo, plan_name, max_usuarios, fecha_inicio, fecha_fin, estado)
       VALUES ($1,$2,$3,$4,$5,$6,$7)
       ON CONFLICT (barberia_id) DO UPDATE SET
         tipo = EXCLUDED.tipo,
         plan_name = EXCLUDED.plan_name,
         max_usuarios = EXCLUDED.max_usuarios,
         fecha_inicio = EXCLUDED.fecha_inicio,
         fecha_fin = EXCLUDED.fecha_fin,
         estado = EXCLUDED.estado
       RETURNING *`,
      [barberia_id, tipo, plan_name, max_usuarios, fecha_inicio, fecha_fin, estado]
    );
    res.status(201).json(rows[0]);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Server error" });
  }
});

// Obtener suscripción por barbería
router.get("/:barberia_id", authRequired, async (req, res) => {
  try {
    const { barberia_id } = req.params;
    const { rows } = await pool.query(
      `SELECT * FROM suscripciones WHERE barberia_id = $1`,
      [barberia_id]
    );
    res.json(rows[0] || null);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Server error" });
  }
});

export default router;
