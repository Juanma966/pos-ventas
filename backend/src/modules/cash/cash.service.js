import { PrismaClient } from '@prisma/client';
import { AppError } from '../../middleware/error.middleware.js';

const prisma = new PrismaClient();

const sessionInclude = {
  user: { select: { id: true, name: true } },
  movements: {
    include: { user: { select: { id: true, name: true } } },
    orderBy: { id: 'asc' },
  },
};

// Los movimientos SALE e INCOME suman al efectivo; RETURN y EXPENSE restan.
const ADD_TYPES = ['SALE', 'INCOME'];

export function computeBalance(session) {
  const opening = Number(session.openingAmount);
  const movementsTotal = session.movements.reduce((acc, m) => {
    const amount = Number(m.amount);
    return acc + (ADD_TYPES.includes(m.type) ? amount : -amount);
  }, 0);
  return Number((opening + movementsTotal).toFixed(2));
}

// Devuelve la sesión OPEN actual (o null). Usa el mismo cliente/tx que se le pase.
export async function findOpenSession(client = prisma) {
  return client.cashSession.findFirst({ where: { status: 'OPEN' } });
}

export const cashService = {
  async getCurrent() {
    const session = await prisma.cashSession.findFirst({
      where: { status: 'OPEN' },
      include: sessionInclude,
    });
    if (!session) return null;
    return { ...session, balance: computeBalance(session) };
  },

  async getSessions({ page = 1, limit = 20 } = {}) {
    const where = { status: 'CLOSED' };
    const [total, items] = await Promise.all([
      prisma.cashSession.count({ where }),
      prisma.cashSession.findMany({
        where,
        include: { user: { select: { id: true, name: true } } },
        orderBy: { closedAt: 'desc' },
        skip: (page - 1) * limit,
        take: Number(limit),
      }),
    ]);
    return { items, total, page: Number(page), limit: Number(limit), pages: Math.ceil(total / limit) };
  },

  async open(data, userId) {
    const existing = await findOpenSession();
    if (existing) throw new AppError('Ya hay una caja abierta');

    const openingAmount = Number(data.openingAmount);
    if (Number.isNaN(openingAmount) || openingAmount < 0) {
      throw new AppError('El monto de apertura no puede ser negativo');
    }

    const session = await prisma.cashSession.create({
      data: { userId, openingAmount, notes: data.notes || null },
      include: sessionInclude,
    });
    return { ...session, balance: computeBalance(session) };
  },

  async addMovement(data, userId) {
    if (!['INCOME', 'EXPENSE'].includes(data.type)) {
      throw new AppError('Tipo de movimiento inválido');
    }
    const amount = Number(data.amount);
    if (Number.isNaN(amount) || amount <= 0) {
      throw new AppError('El monto debe ser mayor a 0');
    }

    const session = await findOpenSession();
    if (!session) throw new AppError('No hay una caja abierta');

    await prisma.cashMovement.create({
      data: {
        sessionId: session.id,
        userId,
        type: data.type,
        amount,
        description: data.description || null,
      },
    });

    return cashService.getCurrent();
  },

  async close(data, userId) {
    const session = await prisma.cashSession.findFirst({
      where: { status: 'OPEN' },
      include: sessionInclude,
    });
    if (!session) throw new AppError('No hay una caja abierta');

    const countedAmount = Number(data.countedAmount);
    if (Number.isNaN(countedAmount) || countedAmount < 0) {
      throw new AppError('El monto contado no puede ser negativo');
    }

    const expected = computeBalance(session);
    const difference = Number((countedAmount - expected).toFixed(2));

    return prisma.cashSession.update({
      where: { id: session.id },
      data: {
        status: 'CLOSED',
        closingAmount: countedAmount,
        expectedAmount: expected,
        difference,
        notes: data.notes ?? session.notes,
        closedAt: new Date(),
        // userId de apertura se mantiene; el cierre lo hace el usuario autenticado (no se persiste por separado en esta etapa)
      },
      include: sessionInclude,
    });
  },
};
