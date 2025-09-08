import { Client } from 'pg';
import bcrypt from 'bcryptjs';

// ---------------- CONFIGURACIÓN ----------------
const dbConfig = {
  user: 'multi_plataforma_db_user',
  host: 'dpg-d2suc7muk2gs73cat540-a.oregon-postgres.render.com',
  database: 'multi_plataforma_db',
  password: 'Z5Rit1gO3eCtKpYqkbf4VWAEAkEF5AxB',
  port: 5432,
  ssl: { rejectUnauthorized: false } // 👈 importante para Render
};

// Datos del SuperAdmin
const superAdminData = {
  name: 'Admin Super', // 👈 un solo campo de nombre
  email: 'admin@admin.com', // 👈 mejor agregar correo
  phone: '0000000000',
  username: 'admin',
  password: 'Admin123!', // contraseña en texto plano
  role: 'SuperAdmin',
  businessId: null,
};

const createSuperAdmin = async () => {
  const client = new Client(dbConfig);

  try {
    await client.connect();
    console.log('Conectado a la base de datos ✅');

    // 1️⃣ Verificar si ya existe un SuperAdmin
    const checkRes = await client.query(
      `SELECT * FROM users WHERE role = $1`,
      [superAdminData.role]
    );

    if (checkRes.rows.length > 0) {
      console.log('⚠️ SuperAdmin ya existe:', checkRes.rows[0].username);
      return;
    }

    // 2️⃣ Generar hash de la contraseña
    const hashedPassword = await bcrypt.hash(superAdminData.password, 10);

    // 3️⃣ Insertar SuperAdmin
      const insertQuery = `
        INSERT INTO "user" ("firstName", "lastName", "phone", "username", "password", "role", "businessId")
        VALUES ($1, $2, $3, $4, $5, $6, $7)
        RETURNING *;
      `;




    const insertValues = [
      superAdminData.name,
      superAdminData.email,
      superAdminData.phone,
      superAdminData.username,
      hashedPassword,
      superAdminData.role,
      superAdminData.businessId,
    ];

    const res = await client.query(insertQuery, insertValues);
    console.log('✅ SuperAdmin creado:', res.rows[0].username);

  } catch (err) {
    console.error('❌ Error creando SuperAdmin:', err);
  } finally {
    await client.end();
    console.log('Conexión cerrada');
  }
};

createSuperAdmin();
