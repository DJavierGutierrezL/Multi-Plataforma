/**
 * Seed script - run after `npx prisma generate` and `npx prisma migrate dev`
 * It will create a SuperAdmin (username: admin, password: admin123) and a Basic plan if missing.
 */
const bcrypt = require('bcrypt');
const prisma = require('../src/prismaClient');

async function main() {
  const pass = await bcrypt.hash('admin123', 10);
  const adminExists = await prisma.user.findUnique({ where: { username: 'admin' } });
  if (!adminExists) {
    await prisma.user.create({
      data: {
        firstName: 'Super',
        lastName: 'Admin',
        username: 'admin',
        email: 'admin@multi.com',
        password: pass,
        role: 'SuperAdmin'
      }
    });
    console.log('Created SuperAdmin (admin/admin123)');
  } else {
    console.log('SuperAdmin already exists');
  }
  const plan = await prisma.plan.findFirst({ where: { name: 'Basic' }});
  if (!plan) {
    await prisma.plan.create({ data: { name: 'Basic', price: 0, features: [] }});
    console.log('Created Basic plan');
  }
}

main().catch(e => { console.error(e); process.exit(1); }).finally(() => prisma.$disconnect());