const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');

const prisma = new PrismaClient();

async function main() {
  const email = "admin@multi.com";       // Email del superAdmin
  const username = "superadmin";         // Username único
  const password = "123456";             // Contraseña inicial (cámbiala luego)
  const hashedPassword = await bcrypt.hash(password, 10);

  const user = await prisma.user.upsert({
    where: { username: username },  // Busca por username para no duplicar
    update: {},
    create: {
      firstName: "Javier",
      lastName: "Gutierrez",
      username: username,
      email: email,
      password: hashedPassword,
      role: "SUPERADMIN"
    },
  });

  console.log("Usuario SUPERADMIN creado:", user);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
