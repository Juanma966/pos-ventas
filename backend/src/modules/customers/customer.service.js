import { PrismaClient } from '@prisma/client';
import { AppError } from '../../middleware/error.middleware.js';

const prisma = new PrismaClient();

export const customerService = {
  async findAll({ search = '', active, page = 1, limit = 20 } = {}) {
    const where = {
      ...(search && {
        OR: [
          { name: { contains: search, mode: 'insensitive' } },
          { email: { contains: search, mode: 'insensitive' } },
          { document: { contains: search, mode: 'insensitive' } },
          { phone: { contains: search, mode: 'insensitive' } },
        ],
      }),
      ...(active !== undefined && { active: active === 'true' }),
    };

    const [total, items] = await Promise.all([
      prisma.customer.count({ where }),
      prisma.customer.findMany({
        where,
        orderBy: { name: 'asc' },
        skip: (page - 1) * limit,
        take: Number(limit),
      }),
    ]);

    return { items, total, page: Number(page), limit: Number(limit), pages: Math.ceil(total / limit) };
  },

  async findById(id) {
    const customer = await prisma.customer.findUnique({ where: { id } });
    if (!customer) throw new AppError('Cliente no encontrado', 404);
    return customer;
  },

  async create(data) {
    if (data.email) {
      const exists = await prisma.customer.findUnique({ where: { email: data.email } });
      if (exists) throw new AppError('Ya existe un cliente con ese email');
    }
    if (data.document) {
      const exists = await prisma.customer.findUnique({ where: { document: data.document } });
      if (exists) throw new AppError('Ya existe un cliente con ese documento');
    }
    return prisma.customer.create({ data });
  },

  async update(id, data) {
    await customerService.findById(id);
    if (data.email) {
      const exists = await prisma.customer.findFirst({ where: { email: data.email, NOT: { id } } });
      if (exists) throw new AppError('Ya existe un cliente con ese email');
    }
    if (data.document) {
      const exists = await prisma.customer.findFirst({ where: { document: data.document, NOT: { id } } });
      if (exists) throw new AppError('Ya existe un cliente con ese documento');
    }
    return prisma.customer.update({ where: { id }, data });
  },

  async remove(id) {
    await customerService.findById(id);
    return prisma.customer.delete({ where: { id } });
  },
};
