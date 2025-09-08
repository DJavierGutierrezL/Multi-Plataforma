import { Client } from 'pg';
import bcrypt from 'bcryptjs';

// ---------------- CONFIGURACIÓN ----------------
const dbConfig = {
  user: 'multi_plataforma_db_user',
  host: 'dpg-d2suc7muk2gs73cat540-a.oregon-postgres.render.com',
  database: 'multi_plataforma_db',
  password: 'Z5Rit1gO3eCtKpYqkbf4VWAEAkEF5AxB',
  port: 5432,
  ssl: { rejectUnauthorized: false }, // importante para Render
};

// Datos del Admin
const adminData = {
  firstName: 'Super',
  lastName: 'Admin',
  email: 'admin@admin.com',
  phone: '0000000000',
  username: 'admin',   // opcional si tu sistema lo usa
  password: 'Admin123!',
  role: 'admin',
  businessId: null,
};

const createAdmin = async () => {
  const client = new Client(dbConfig);

  try {
    await client.connect();
    console.log('Conectado a la base de datos ✅');

    // 1️⃣ Verificar si ya existe un usuario con ese email
    const checkRes = await client.query(
      `SELECT * FROM users WHERE email = $1`,
      [adminData.email]
    );

    if (checkRes.rows.length > 0) {
      console.log('⚠️ Usuario admin ya existe:', checkRes.rows[0].email);
      return;
    }

    // 2️⃣ Generar hash de la contraseña
    const hashedPassword = await bcrypt.hash(adminData.password, 10);

    // 3️⃣ Insertar el admin
    const insertQuery = `
      INSERT INTO users (name, email, phone, username, password, role, businessId)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING *;
    `;

    const insertValues = [
      adminData.name,   // un solo campo de nombre
      adminData.email,
      adminData.phone,
      adminData.username,
      hashedPassword,
      adminData.role,
      adminData.businessId,
    ];

    const res = await client.query(insertQuery, insertValues);
    console.log('✅ Usuario admin creado:', res.rows[0].email);

  } catch (err) {
    console.error('❌ Error creando admin:', err);
  } finally {
    await client.end();
    console.log('Conexión cerrada');
  }
};

createAdmin();
