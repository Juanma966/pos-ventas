import { PrismaClient } from '@prisma/client';
import { AppError } from '../../middleware/error.middleware.js';

const prisma = new PrismaClient();

const CATEGORIES = ['ALQUILER', 'SERVICIO', 'CREDITO', 'OTRO'];

export const fixedExpenseService = {
  async findAll({ category, active } = {}) {
    const where = {
      ...(category && { category }),
      ...(active !== undefined && { active: active === 'true' }),
    };
    return prisma.fixedExpense.findMany({ where, orderBy: { name: 'asc' } });
  },

  async findById(id) {
    const expense = await prisma.fixedExpense.findUnique({ where: { id } });
    if (!expense) throw new AppError('Gasto fijo no encontrado', 404);
    return expense;
  },

  // Resumen para el dashboard: total mensual y desglose por categoría (solo activos).
  async summary() {
    const items = await prisma.fixedExpense.findMany({ where: { active: true } });
    let total = 0;
    const byCategoryMap = {};
    for (const e of items) {
      const amount = Number(e.amount);
      total += amount;
      byCategoryMap[e.category] = (byCategoryMap[e.category] || 0) + amount;
    }
    return {
      total: Number(total.toFixed(2)),
      count: items.length,
      byCategory: Object.entries(byCategoryMap).map(([category, amount]) => ({ category, amount: Number(amount.toFixed(2)) })),
    };
  },

  async create(data) {
    if (!data.name) throw new AppError('El nombre es requerido');
    if (!CATEGORIES.includes(data.category)) throw new AppError('Categoría inválida');
    const amount = Number(data.amount);
    if (Number.isNaN(amount) || amount < 0) throw new AppError('El monto no puede ser negativo');
    return prisma.fixedExpense.create({
      data: { name: data.name, category: data.category, amount, active: data.active ?? true },
    });
  },

  async update(id, data) {
    await fixedExpenseService.findById(id);
    if (data.category && !CATEGORIES.includes(data.category)) throw new AppError('Categoría inválida');
    if (data.amount !== undefined && (Number.isNaN(Number(data.amount)) || Number(data.amount) < 0)) {
      throw new AppError('El monto no puede ser negativo');
    }
    return prisma.fixedExpense.update({
      where: { id },
      data: {
        ...(data.name !== undefined && { name: data.name }),
        ...(data.category !== undefined && { category: data.category }),
        ...(data.amount !== undefined && { amount: Number(data.amount) }),
        ...(data.active !== undefined && { active: data.active }),
      },
    });
  },

  async remove(id) {
    await fixedExpenseService.findById(id);
    return prisma.fixedExpense.delete({ where: { id } });
  },
};
