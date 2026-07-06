import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  // Roles base
  const adminRole = await prisma.role.upsert({
    where: { name: 'admin' },
    update: {},
    create: { name: 'admin', description: 'Administrador del sistema' },
  });

  await prisma.role.upsert({
    where: { name: 'cajero' },
    update: {},
    create: { name: 'cajero', description: 'Operador de caja' },
  });

  await prisma.role.upsert({
    where: { name: 'vendedor' },
    update: {},
    create: { name: 'vendedor', description: 'Vendedor' },
  });

  // Usuario admin
  const hashedPassword = await bcrypt.hash('admin123', 10);
  const admin = await prisma.user.upsert({
    where: { email: 'admin@pos.com' },
    update: {},
    create: {
      name: 'Administrador',
      email: 'admin@pos.com',
      password: hashedPassword,
      roleId: adminRole.id,
    },
  });

  console.log(`[seed] Roles creados: admin, cajero, vendedor`);
  console.log(`[seed] Usuario admin: ${admin.email} / admin123`);
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
