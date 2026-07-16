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

  // Detalle para la pantalla de clientes: cliente + estadísticas + últimas compras.
  // "Total gastado" es neto: excluye ventas anuladas y resta las devoluciones.
  async getDetail(id) {
    const customer = await customerService.findById(id);

    const [sales, recentSales] = await Promise.all([
      prisma.sale.findMany({
        where: { customerId: id },
        select: { status: true, total: true, createdAt: true, returns: { select: { total: true } } },
      }),
      prisma.sale.findMany({
        where: { customerId: id },
        orderBy: { createdAt: 'desc' },
        take: 20,
        select: { id: true, status: true, paymentMethod: true, total: true, createdAt: true },
      }),
    ]);

    const valid = sales.filter((s) => s.status !== 'CANCELLED');
    const gross = valid.reduce((acc, s) => acc + Number(s.total), 0);
    const returned = valid.reduce((acc, s) => acc + s.returns.reduce((a, r) => a + Number(r.total), 0), 0);
    const salesCount = valid.length;

    const stats = {
      salesCount,
      totalSpent: Number((gross - returned).toFixed(2)),
      avgTicket: salesCount ? Number((gross / salesCount).toFixed(2)) : 0,
      lastSaleAt: salesCount
        ? valid.reduce((max, s) => (s.createdAt > max ? s.createdAt : max), valid[0].createdAt)
        : null,
    };

    return { ...customer, stats, recentSales };
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
