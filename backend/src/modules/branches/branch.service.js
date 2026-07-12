import { PrismaClient } from '@prisma/client';
import { AppError } from '../../middleware/error.middleware.js';

const prisma = new PrismaClient();

export const branchService = {
  async findAll({ search = '' } = {}) {
    const where = search
      ? { OR: [{ name: { contains: search, mode: 'insensitive' } }, { address: { contains: search, mode: 'insensitive' } }] }
      : {};
    return prisma.branch.findMany({ where, orderBy: { name: 'asc' } });
  },

  async findById(id) {
    const branch = await prisma.branch.findUnique({ where: { id } });
    if (!branch) throw new AppError('Sucursal no encontrada', 404);
    return branch;
  },

  async create(data) {
    if (!data.name) throw new AppError('El nombre es requerido');
    return prisma.branch.create({
      data: {
        name: data.name,
        address: data.address || null,
        phone: data.phone || null,
        active: data.active ?? true,
      },
    });
  },

  async update(id, data) {
    await branchService.findById(id);
    return prisma.branch.update({
      where: { id },
      data: {
        ...(data.name !== undefined && { name: data.name }),
        ...(data.address !== undefined && { address: data.address || null }),
        ...(data.phone !== undefined && { phone: data.phone || null }),
        ...(data.active !== undefined && { active: data.active }),
      },
    });
  },

  async remove(id) {
    await branchService.findById(id);
    return prisma.branch.delete({ where: { id } });
  },
};
