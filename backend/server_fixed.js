
// server_fixed.js - minimal Express backend aligned with schema.sql assumptions.
// - Expects env vars: DATABASE_URL (or PGHOST/PGUSER/PGPASSWORD/PGDATABASE/PGPORT)
// - Provides simple endpoints: POST /api/users (create user), POST /api/clientes (create cliente)
// - Uses password_hash and columns: name, email, phone
const express = require('express');
const { Pool } = require('pg');
const bcrypt = require('bcrypt');
const bodyParser = require('body-parser');

const app = express();
app.use(bodyParser.json());

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

app.get('/api/health', (req, res) => res.json({ok:true}));

// Create user (superadmin or normal)
// body: { name, email, password, role }
app.post('/api/users', async (req, res) => {
  try {
    const { name, email, password, role } = req.body;
    if (!email || !password) return res.status(400).json({error:'email and password required'});
    const hashed = await bcrypt.hash(password, 10);
    const q = 'INSERT INTO users (name, email, password_hash, role, created_at) VALUES ($1,$2,$3,$4, NOW()) RETURNING id, name, email, role';
    const r = await pool.query(q, [name||null, email, hashed, role||'user']);
    res.json({user: r.rows[0]});
  } catch (err) {
    console.error('users POST error', err.message);
    res.status(500).json({error: err.message});
  }
});

// Create cliente
// body: { nombres, apellidos, correo, telefono }  OR { name, email, phone }
app.post('/api/clientes', async (req, res) => {
  try {
    const body = req.body || {};
    const name = (body.name) ? body.name : [body.nombres||'', body.apellidos||''].join(' ').trim();
    const email = body.email || body.correo || null;
    const phone = body.phone || body.telefono || null;
    const q = 'INSERT INTO clientes (name, email, phone, created_at) VALUES ($1,$2,$3, NOW()) RETURNING *';
    const r = await pool.query(q, [name || null, email, phone]);
    res.json({cliente: r.rows[0]});
  } catch (err) {
    console.error('clientes POST error', err.message);
    res.status(500).json({error: err.message});
  }
});

// Simple fetch clientes
app.get('/api/clientes', async (req, res) => {
  try {
    const r = await pool.query('SELECT * FROM clientes ORDER BY created_at DESC LIMIT 200');
    res.json({clientes: r.rows});
  } catch (err) {
    console.error('clientes GET error', err.message);
    res.status(500).json({error: err.message});
  }
});

const port = process.env.PORT || 3001;
app.listen(port, () => {
  console.log('server_fixed listening on', port);
});
