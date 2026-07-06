import { PrismaClient } from '@prisma/client';
import { AppError } from '../../middleware/error.middleware.js';

const prisma = new PrismaClient();

export const brandService = {
  async findAll() {
    return prisma.brand.findMany({ orderBy: { name: 'asc' } });
  },

  async findById(id) {
    const brand = await prisma.brand.findUnique({ where: { id } });
    if (!brand) throw new AppError('Marca no encontrada', 404);
    return brand;
  },

  async create(data) {
    const exists = await prisma.brand.findUnique({ where: { name: data.name } });
    if (exists) throw new AppError('Ya existe una marca con ese nombre');
    return prisma.brand.create({ data });
  },

  async update(id, data) {
    await brandService.findById(id);
    if (data.name) {
      const exists = await prisma.brand.findFirst({ where: { name: data.name, NOT: { id } } });
      if (exists) throw new AppError('Ya existe una marca con ese nombre');
    }
    return prisma.brand.update({ where: { id }, data });
  },

  async remove(id) {
    await brandService.findById(id);
    const hasProducts = await prisma.product.count({ where: { brandId: id } });
    if (hasProducts) throw new AppError('No se puede eliminar: la marca tiene productos asociados');
    return prisma.brand.delete({ where: { id } });
  },
};
