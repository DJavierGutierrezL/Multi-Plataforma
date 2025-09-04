import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { pool } from "./db.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export async function ensureDatabase() {
  const schemaPath = path.join(__dirname, "schema.sql");
  const sql = fs.readFileSync(schemaPath, "utf8");
  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    await client.query(sql);
    await client.query("COMMIT");
    console.log("Database schema ensured.");
  } catch (err) {
    await client.query("ROLLBACK");
    console.error("Error ensuring database schema:", err);
    throw err;
  } finally {
    client.release();
  }
}

// If run as a script: node setup_db.js
if (import.meta.url === `file://${__filename}`) {
  ensureDatabase().then(() => process.exit(0)).catch(() => process.exit(1));
}
