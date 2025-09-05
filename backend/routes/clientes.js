import { Router } from "express";
import { pool } from "../db.js";
import { authRequired } from "../middleware/auth.js";

const router = Router();

// Get all clientes
router.get("/", authRequired, async (req, res) => {
  try {
    const { rows } = await pool.query(`SELECT * FROM clientes ORDER BY created_at DESC`);
    res.json(rows);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Server error" });
  }
});

// Create cliente
router.post("/", authRequired, async (req, res) => {
  try {
    const { name, email = null, phone = null, birthDate = null, preferences = null, serviceHistory = [] } = req.body;
    const { rows } = await pool.query(
      `INSERT INTO clientes (name, email, phone, birth_date, preferences, service_history) VALUES ($1,$2,$3,$4,$5,$6) RETURNING *`,
      [name, email, phone, birthDate, preferences, JSON.stringify(serviceHistory)]
    );
    res.status(201).json(rows[0]);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Server error" });
  }
});

// Update cliente
router.put("/:id", authRequired, async (req, res) => {
  try {
    const { id } = req.params;
    const fields = req.body;
    const allowed = ['name','email','phone','birthDate','preferences','serviceHistory'];
    const sets = [];
    const values = [];
    let idx = 1;
    for (const k of allowed) {
      if (k in fields) {
        if (k === 'serviceHistory') {
          sets.push(`service_history = $${idx}`);
          values.push(JSON.stringify(fields[k]));
        } else if (k === 'birthDate') {
          sets.push(`birth_date = $${idx}`);
          values.push(fields[k]);
        } else {
          sets.push(`${k} = $${idx}`);
          values.push(fields[k]);
        }
        idx++;
      }
    }
    if (sets.length === 0) return res.status(400).json({ error: "No valid fields to update" });
    const query = `UPDATE clientes SET ${sets.join(', ')} WHERE id = $${idx} RETURNING *`;
    values.push(id);
    const { rows } = await pool.query(query, values);
    res.json(rows[0]);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Server error" });
  }
});

// Delete cliente
router.delete("/:id", authRequired, async (req, res) => {
  try {
    const { id } = req.params;
    await pool.query(`DELETE FROM clientes WHERE id = $1`, [id]);
    res.json({ success: true });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Server error" });
  }
});

export default router;
