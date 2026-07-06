import { PrismaClient } from '@prisma/client';
import { AppError } from '../../middleware/error.middleware.js';

const prisma = new PrismaClient();

export const supplierService = {
  async findAll({ search = '', active, page = 1, limit = 20 } = {}) {
    const where = {
      ...(search && {
        OR: [
          { name: { contains: search, mode: 'insensitive' } },
          { email: { contains: search, mode: 'insensitive' } },
          { document: { contains: search, mode: 'insensitive' } },
          { phone: { contains: search, mode: 'insensitive' } },
          { contactName: { contains: search, mode: 'insensitive' } },
        ],
      }),
      ...(active !== undefined && { active: active === 'true' }),
    };

    const [total, items] = await Promise.all([
      prisma.supplier.count({ where }),
      prisma.supplier.findMany({
        where,
        orderBy: { name: 'asc' },
        skip: (page - 1) * limit,
        take: Number(limit),
      }),
    ]);

    return { items, total, page: Number(page), limit: Number(limit), pages: Math.ceil(total / limit) };
  },

  async findById(id) {
    const supplier = await prisma.supplier.findUnique({ where: { id } });
    if (!supplier) throw new AppError('Proveedor no encontrado', 404);
    return supplier;
  },

  async create(data) {
    if (data.email) {
      const exists = await prisma.supplier.findUnique({ where: { email: data.email } });
      if (exists) throw new AppError('Ya existe un proveedor con ese email');
    }
    if (data.document) {
      const exists = await prisma.supplier.findUnique({ where: { document: data.document } });
      if (exists) throw new AppError('Ya existe un proveedor con ese documento');
    }
    return prisma.supplier.create({ data });
  },

  async update(id, data) {
    await supplierService.findById(id);
    if (data.email) {
      const exists = await prisma.supplier.findFirst({ where: { email: data.email, NOT: { id } } });
      if (exists) throw new AppError('Ya existe un proveedor con ese email');
    }
    if (data.document) {
      const exists = await prisma.supplier.findFirst({ where: { document: data.document, NOT: { id } } });
      if (exists) throw new AppError('Ya existe un proveedor con ese documento');
    }
    return prisma.supplier.update({ where: { id }, data });
  },

  async remove(id) {
    await supplierService.findById(id);
    return prisma.supplier.delete({ where: { id } });
  },
};
