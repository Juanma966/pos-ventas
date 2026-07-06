import { PrismaClient } from '@prisma/client';
import { AppError } from '../../middleware/error.middleware.js';

const prisma = new PrismaClient();

const purchaseInclude = {
  supplier: { select: { id: true, name: true } },
  user: { select: { id: true, name: true } },
  items: {
    include: { product: { select: { id: true, name: true, barcode: true } } },
    orderBy: { id: 'asc' },
  },
};

const listInclude = {
  supplier: { select: { id: true, name: true } },
  user: { select: { id: true, name: true } },
  _count: { select: { items: true } },
};

// Normaliza y valida los renglones; devuelve items limpios y el total calculado.
function buildItems(rawItems) {
  if (!Array.isArray(rawItems) || rawItems.length === 0) {
    throw new AppError('La compra debe tener al menos un producto');
  }

  const items = rawItems.map((item) => {
    const productId = Number(item.productId);
    const quantity = Number(item.quantity);
    const cost = Number(item.cost);

    if (!productId) throw new AppError('Producto inválido en un renglón');
    if (!Number.isInteger(quantity) || quantity <= 0) {
      throw new AppError('La cantidad de cada renglón debe ser un entero mayor a 0');
    }
    if (Number.isNaN(cost) || cost < 0) {
      throw new AppError('El costo de cada renglón no puede ser negativo');
    }

    return { productId, quantity, cost, subtotal: Number((quantity * cost).toFixed(2)) };
  });

  const total = Number(items.reduce((acc, i) => acc + i.subtotal, 0).toFixed(2));
  return { items, total };
}

export const purchaseService = {
  async findAll({ search = '', status, supplierId, page = 1, limit = 20 } = {}) {
    const where = {
      ...(status && { status }),
      ...(supplierId && { supplierId: Number(supplierId) }),
      ...(search && {
        supplier: { name: { contains: search, mode: 'insensitive' } },
      }),
    };

    const [total, items] = await Promise.all([
      prisma.purchase.count({ where }),
      prisma.purchase.findMany({
        where,
        include: listInclude,
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: Number(limit),
      }),
    ]);

    return { items, total, page: Number(page), limit: Number(limit), pages: Math.ceil(total / limit) };
  },

  async findById(id) {
    const purchase = await prisma.purchase.findUnique({ where: { id }, include: purchaseInclude });
    if (!purchase) throw new AppError('Compra no encontrada', 404);
    return purchase;
  },

  async create(data, userId) {
    const supplier = await prisma.supplier.findUnique({ where: { id: Number(data.supplierId) } });
    if (!supplier) throw new AppError('Proveedor no encontrado', 404);

    const { items, total } = buildItems(data.items);

    return prisma.purchase.create({
      data: {
        supplierId: supplier.id,
        userId,
        notes: data.notes || null,
        total,
        items: { create: items },
      },
      include: purchaseInclude,
    });
  },

  async update(id, data) {
    const purchase = await purchaseService.findById(id);
    if (purchase.status !== 'PENDING') {
      throw new AppError('Solo se pueden editar compras pendientes');
    }

    const supplier = await prisma.supplier.findUnique({ where: { id: Number(data.supplierId) } });
    if (!supplier) throw new AppError('Proveedor no encontrado', 404);

    const { items, total } = buildItems(data.items);

    // Reemplaza los renglones por completo dentro de una transacción.
    return prisma.$transaction(async (tx) => {
      await tx.purchaseItem.deleteMany({ where: { purchaseId: id } });
      return tx.purchase.update({
        where: { id },
        data: {
          supplierId: supplier.id,
          notes: data.notes || null,
          total,
          items: { create: items },
        },
        include: purchaseInclude,
      });
    });
  },

  async receive(id) {
    const purchase = await purchaseService.findById(id);
    if (purchase.status !== 'PENDING') {
      throw new AppError('Solo se pueden recibir compras pendientes');
    }

    // Transacción: sube stock y actualiza el costo (último costo) de cada producto,
    // luego marca la orden como recibida.
    return prisma.$transaction(async (tx) => {
      for (const item of purchase.items) {
        await tx.product.update({
          where: { id: item.productId },
          data: {
            stock: { increment: item.quantity },
            cost: item.cost,
          },
        });
      }

      return tx.purchase.update({
        where: { id },
        data: { status: 'RECEIVED', receivedAt: new Date() },
        include: purchaseInclude,
      });
    });
  },

  async cancel(id) {
    const purchase = await purchaseService.findById(id);
    if (purchase.status !== 'PENDING') {
      throw new AppError('Solo se pueden cancelar compras pendientes');
    }
    return prisma.purchase.update({
      where: { id },
      data: { status: 'CANCELLED' },
      include: purchaseInclude,
    });
  },

  async remove(id) {
    const purchase = await purchaseService.findById(id);
    if (purchase.status === 'RECEIVED') {
      throw new AppError('No se puede eliminar una compra ya recibida');
    }
    return prisma.purchase.delete({ where: { id } });
  },
};
