import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  // Roles
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
    create: { name: 'Administrador', email: 'admin@pos.com', password: hashedPassword, roleId: adminRole.id },
  });

  // Categorías
  const categorias = ['Bebidas', 'Alimentos', 'Limpieza', 'Electrónica', 'Indumentaria'];
  const categoriasCreadas = {};
  for (const nombre of categorias) {
    const c = await prisma.category.upsert({
      where: { name: nombre },
      update: {},
      create: { name: nombre },
    });
    categoriasCreadas[nombre] = c;
  }

  // Marcas
  const marcas = ['Genérico', 'Arcor', 'Coca-Cola', 'Samsung', 'Nike'];
  const marcasCreadas = {};
  for (const nombre of marcas) {
    const b = await prisma.brand.upsert({
      where: { name: nombre },
      update: {},
      create: { name: nombre },
    });
    marcasCreadas[nombre] = b;
  }

  // Productos de ejemplo
  const productos = [
    { name: 'Coca-Cola 500ml', barcode: '7790895000107', price: 1200, cost: 800, stock: 48, minStock: 10, categoryId: categoriasCreadas['Bebidas'].id, brandId: marcasCreadas['Coca-Cola'].id },
    { name: 'Agua mineral 1.5L', barcode: '7798062612345', price: 600, cost: 350, stock: 3, minStock: 10, categoryId: categoriasCreadas['Bebidas'].id, brandId: marcasCreadas['Genérico'].id },
    { name: 'Alfajor triple', barcode: '7790040012345', price: 450, cost: 250, stock: 60, minStock: 15, categoryId: categoriasCreadas['Alimentos'].id, brandId: marcasCreadas['Arcor'].id },
    { name: 'Detergente 750ml', barcode: '7793045001234', price: 980, cost: 600, stock: 4, minStock: 8, categoryId: categoriasCreadas['Limpieza'].id, brandId: marcasCreadas['Genérico'].id },
    { name: 'Auriculares Bluetooth', barcode: '0123456789012', price: 15000, cost: 8000, stock: 12, minStock: 3, categoryId: categoriasCreadas['Electrónica'].id, brandId: marcasCreadas['Samsung'].id },
  ];

  for (const p of productos) {
    await prisma.product.upsert({
      where: { barcode: p.barcode },
      update: {},
      create: { ...p, price: p.price, cost: p.cost },
    });
  }

  console.log(`[seed] Roles: admin, cajero, vendedor`);
  console.log(`[seed] Usuario: ${admin.email} / admin123`);
  console.log(`[seed] Categorías: ${categorias.join(', ')}`);
  console.log(`[seed] Marcas: ${marcas.join(', ')}`);
  console.log(`[seed] Productos: ${productos.length} creados`);
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
