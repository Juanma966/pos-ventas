// Prepara la base de datos de TEST desde cero. Se ejecuta antes de la suite
// (ver script "test" en package.json):
//   1. Borra y recrea la base de test aplicando todas las migraciones.
//   2. Corre el seed (roles, admin, categorías, marcas, productos).
//   3. Crea un usuario por rol para probar permisos (cajero y vendedor).
import './helpers/env.js';
import { execSync } from 'node:child_process';

console.log('[tests] Base de test:', process.env.DATABASE_URL);

const run = (cmd) => execSync(cmd, { stdio: 'inherit', env: process.env });

console.log('[tests] Reseteando esquema (migrate reset)...');
run('npx prisma migrate reset --force --skip-generate --skip-seed');

console.log('[tests] Sembrando datos base (seed)...');
run('node prisma/seed.js');

console.log('[tests] Creando usuarios de prueba por rol...');
const { PrismaClient } = await import('@prisma/client');
const bcrypt = (await import('bcryptjs')).default;
const prisma = new PrismaClient();

const roles = await prisma.role.findMany();
const roleId = (name) => roles.find((r) => r.name === name).id;

const testUsers = [
  { role: 'cajero', name: 'Cajero Test', email: 'cajero@test.com', password: 'cajero123' },
  { role: 'vendedor', name: 'Vendedor Test', email: 'vendedor@test.com', password: 'vendedor123' }
];

for (const u of testUsers) {
  await prisma.user.upsert({
    where: { email: u.email },
    update: {},
    create: { name: u.name, email: u.email, password: await bcrypt.hash(u.password, 10), roleId: roleId(u.role) }
  });
}

await prisma.$disconnect();
console.log('[tests] Base de test lista.\n');
