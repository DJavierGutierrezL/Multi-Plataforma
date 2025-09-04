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

// Ejecutar solo si se corre setup_db.js directamente
if (process.argv[1].endsWith("setup_db.js")) {
  ensureDatabase()
    .then(() => {
      console.log("Migrations run successfully.");
      process.exit(0);
    })
    .catch((err) => {
      console.error("Migrations failed:", err);
      process.exit(1);
    });
}
