// backend/src/db.js
const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    // Forzamos la conexión SSL para todos los entornos, ya que Render la requiere.
    ssl: {
        rejectUnauthorized: false
    }
});

module.exports = {
    query: (text, params) => pool.query(text, params),
};