import { PrismaClient } from '@prisma/client';
import { AppError } from '../../middleware/error.middleware.js';

const prisma = new PrismaClient();

const movementInclude = {
  product: { select: { id: true, name: true, barcode: true } },
  user: { select: { id: true, name: true } },
};

// Registra un movimiento de inventario. Usar el cliente transaccional (tx) para
// mantener atomicidad con el cambio de stock que lo origina.
// quantity: con signo (+ entrada / − salida). stockAfter: stock resultante.
export async function recordInventoryMovement(tx, { productId, userId, type, quantity, stockAfter, reason = null }) {
  return tx.inventoryMovement.create({
    data: { productId, userId, type, quantity, stockAfter, reason },
  });
}

export const inventoryService = {
  async findAll({ productId, type, page = 1, limit = 20 } = {}) {
    const where = {
      ...(productId && { productId: Number(productId) }),
      ...(type && { type }),
    };

    const [total, items] = await Promise.all([
      prisma.inventoryMovement.count({ where }),
      prisma.inventoryMovement.findMany({
        where,
        include: movementInclude,
        orderBy: { id: 'desc' },
        skip: (page - 1) * limit,
        take: Number(limit),
      }),
    ]);

    return { items, total, page: Number(page), limit: Number(limit), pages: Math.ceil(total / limit) };
  },

  // Ajuste manual de stock. mode: 'ENTRADA' | 'SALIDA' | 'CONTEO'.
  async createAdjustment(data, userId) {
    const productId = Number(data.productId);
    const product = await prisma.product.findUnique({ where: { id: productId } });
    if (!product) throw new AppError('Producto no encontrado', 404);

    const mode = data.mode;
    let newStock;
    let delta;

    if (mode === 'ENTRADA') {
      const qty = Number(data.quantity);
      if (!Number.isInteger(qty) || qty <= 0) throw new AppError('La cantidad debe ser un entero mayor a 0');
      delta = qty;
      newStock = product.stock + qty;
    } else if (mode === 'SALIDA') {
      const qty = Number(data.quantity);
      if (!Number.isInteger(qty) || qty <= 0) throw new AppError('La cantidad debe ser un entero mayor a 0');
      if (qty > product.stock) throw new AppError(`No hay stock suficiente (disponible: ${product.stock})`);
      delta = -qty;
      newStock = product.stock - qty;
    } else if (mode === 'CONTEO') {
      const counted = Number(data.countedStock);
      if (!Number.isInteger(counted) || counted < 0) throw new AppError('El stock contado no puede ser negativo');
      delta = counted - product.stock;
      newStock = counted;
      if (delta === 0) throw new AppError('El stock contado coincide con el actual; no hay ajuste que registrar');
    } else {
      throw new AppError('Tipo de ajuste inválido');
    }

    return prisma.$transaction(async (tx) => {
      await tx.product.update({ where: { id: productId }, data: { stock: newStock } });
      return recordInventoryMovement(tx, {
        productId,
        userId,
        type: 'ADJUSTMENT',
        quantity: delta,
        stockAfter: newStock,
        reason: data.reason || null,
      });
    }).then((movement) =>
      prisma.inventoryMovement.findUnique({ where: { id: movement.id }, include: movementInclude })
    );
  },
};
