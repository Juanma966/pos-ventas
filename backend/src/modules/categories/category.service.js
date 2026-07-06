import { PrismaClient } from '@prisma/client';
import { AppError } from '../../middleware/error.middleware.js';

const prisma = new PrismaClient();

export const categoryService = {
  async findAll() {
    return prisma.category.findMany({ orderBy: { name: 'asc' } });
  },

  async findById(id) {
    const category = await prisma.category.findUnique({ where: { id } });
    if (!category) throw new AppError('Categoría no encontrada', 404);
    return category;
  },

  async create(data) {
    const exists = await prisma.category.findUnique({ where: { name: data.name } });
    if (exists) throw new AppError('Ya existe una categoría con ese nombre');
    return prisma.category.create({ data });
  },

  async update(id, data) {
    await categoryService.findById(id);
    if (data.name) {
      const exists = await prisma.category.findFirst({ where: { name: data.name, NOT: { id } } });
      if (exists) throw new AppError('Ya existe una categoría con ese nombre');
    }
    return prisma.category.update({ where: { id }, data });
  },

  async remove(id) {
    await categoryService.findById(id);
    const hasProducts = await prisma.product.count({ where: { categoryId: id } });
    if (hasProducts) throw new AppError('No se puede eliminar: la categoría tiene productos asociados');
    return prisma.category.delete({ where: { id } });
  },
};
