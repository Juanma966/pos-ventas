import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const endOfDay = (d) => { const x = new Date(d); x.setHours(23, 59, 59, 999); return x; };
const startOfDay = (d) => { const x = new Date(d); x.setHours(0, 0, 0, 0); return x; };

export const auditService = {
  async findAll({ userId, entity, action, from, to, page = 1, limit = 20 } = {}) {
    const where = {
      ...(userId && { userId: Number(userId) }),
      ...(entity && { entity }),
      ...(action && { action }),
      ...((from || to) && {
        createdAt: {
          ...(from && { gte: startOfDay(from) }),
          ...(to && { lte: endOfDay(to) }),
        },
      }),
    };

    const [total, items] = await Promise.all([
      prisma.auditLog.count({ where }),
      prisma.auditLog.findMany({
        where,
        include: { user: { select: { id: true, name: true } } },
        orderBy: { id: 'desc' },
        skip: (page - 1) * limit,
        take: Number(limit),
      }),
    ]);

    return { items, total, page: Number(page), limit: Number(limit), pages: Math.ceil(total / limit) };
  },
};
