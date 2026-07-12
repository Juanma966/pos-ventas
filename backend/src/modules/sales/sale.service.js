import { PrismaClient } from '@prisma/client';
import { AppError } from '../../middleware/error.middleware.js';
import { findOpenSession } from '../cash/cash.service.js';
import { recordInventoryMovement } from '../inventory/inventory.service.js';

const prisma = new PrismaClient();

// Registra un movimiento de caja para una venta en efectivo, solo si hay caja abierta.
// Usa el cliente transaccional (tx) para mantener la atomicidad con la venta.
async function registerCashMovement(tx, { sale, type, amount, userId, description }) {
  if (sale.paymentMethod !== 'EFECTIVO') return;
  const session = await findOpenSession(tx);
  if (!session) return;
  await tx.cashMovement.create({
    data: { sessionId: session.id, userId, type, amount, saleId: sale.id, description },
  });
}

const PAYMENT_METHODS = ['EFECTIVO', 'TARJETA', 'TRANSFERENCIA'];

const saleInclude = {
  customer: { select: { id: true, name: true } },
  user: { select: { id: true, name: true } },
  items: {
    include: { product: { select: { id: true, name: true, barcode: true } } },
    orderBy: { id: 'asc' },
  },
  returns: {
    include: { items: true, user: { select: { id: true, name: true } } },
    orderBy: { id: 'asc' },
  },
};

const listInclude = {
  customer: { select: { id: true, name: true } },
  user: { select: { id: true, name: true } },
  _count: { select: { items: true } },
};

export const saleService = {
  async findAll({ search = '', status, paymentMethod, page = 1, limit = 20 } = {}) {
    const where = {
      ...(status && { status }),
      ...(paymentMethod && { paymentMethod }),
      ...(search && {
        customer: { name: { contains: search, mode: 'insensitive' } },
      }),
    };

    const [total, items] = await Promise.all([
      prisma.sale.count({ where }),
      prisma.sale.findMany({
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
    const sale = await prisma.sale.findUnique({ where: { id }, include: saleInclude });
    if (!sale) throw new AppError('Venta no encontrada', 404);
    return sale;
  },

  async create(data, userId) {
    if (!PAYMENT_METHODS.includes(data.paymentMethod)) {
      throw new AppError('Método de pago inválido');
    }

    if (!Array.isArray(data.items) || data.items.length === 0) {
      throw new AppError('La venta debe tener al menos un producto');
    }

    // Normaliza y valida cada renglón contra el producto real (precio y stock).
    const productIds = data.items.map((i) => Number(i.productId));
    const products = await prisma.product.findMany({ where: { id: { in: productIds } } });
    const productMap = new Map(products.map((p) => [p.id, p]));

    const items = data.items.map((item) => {
      const productId = Number(item.productId);
      const quantity = Number(item.quantity);
      const product = productMap.get(productId);

      if (!product) throw new AppError(`Producto ${productId} no encontrado`, 404);
      if (!Number.isInteger(quantity) || quantity <= 0) {
        throw new AppError(`Cantidad inválida para ${product.name}`);
      }
      if (quantity > product.stock) {
        throw new AppError(`Stock insuficiente de ${product.name} (disponible: ${product.stock})`);
      }

      const price = Number(product.price);
      return { productId, quantity, price, subtotal: Number((price * quantity).toFixed(2)) };
    });

    const subtotal = Number(items.reduce((acc, i) => acc + i.subtotal, 0).toFixed(2));
    const discount = Number(data.discount) || 0;
    if (discount < 0) throw new AppError('El descuento no puede ser negativo');
    if (discount > subtotal) throw new AppError('El descuento no puede superar el subtotal');
    const total = Number((subtotal - discount).toFixed(2));

    let customerId = null;
    if (data.customerId) {
      const customer = await prisma.customer.findUnique({ where: { id: Number(data.customerId) } });
      if (!customer) throw new AppError('Cliente no encontrado', 404);
      customerId = customer.id;
    }

    // Transacción: crea la venta y descuenta el stock de cada producto.
    return prisma.$transaction(async (tx) => {
      const sale = await tx.sale.create({
        data: {
          customerId,
          userId,
          paymentMethod: data.paymentMethod,
          subtotal,
          discount,
          total,
          notes: data.notes || null,
          items: { create: items },
        },
        include: saleInclude,
      });

      for (const item of items) {
        const updated = await tx.product.update({
          where: { id: item.productId },
          data: { stock: { decrement: item.quantity } },
        });
        await recordInventoryMovement(tx, {
          productId: item.productId,
          userId,
          type: 'SALE',
          quantity: -item.quantity,
          stockAfter: updated.stock,
          reason: `Venta V-${String(sale.id).padStart(4, '0')}`,
        });
      }

      await registerCashMovement(tx, { sale, type: 'SALE', amount: total, userId, description: 'Venta en efectivo' });

      return sale;
    });
  },

  async cancel(id, userId) {
    const sale = await saleService.findById(id);
    if (sale.status !== 'COMPLETED') {
      throw new AppError('Solo se pueden anular ventas completadas (sin devoluciones)');
    }

    // Transacción: repone el stock de cada producto y marca la venta como anulada.
    return prisma.$transaction(async (tx) => {
      for (const item of sale.items) {
        const updated = await tx.product.update({
          where: { id: item.productId },
          data: { stock: { increment: item.quantity } },
        });
        await recordInventoryMovement(tx, {
          productId: item.productId,
          userId,
          type: 'SALE_CANCEL',
          quantity: item.quantity,
          stockAfter: updated.stock,
          reason: `Anulación venta V-${String(id).padStart(4, '0')}`,
        });
      }

      await registerCashMovement(tx, { sale, type: 'RETURN', amount: Number(sale.total), userId, description: 'Anulación de venta' });

      return tx.sale.update({
        where: { id },
        data: { status: 'CANCELLED' },
        include: saleInclude,
      });
    });
  },

  async createReturn(saleId, data, userId) {
    const sale = await saleService.findById(saleId);
    if (sale.status === 'CANCELLED') {
      throw new AppError('No se puede devolver una venta anulada');
    }
    if (sale.status === 'RETURNED') {
      throw new AppError('La venta ya fue devuelta por completo');
    }

    if (!Array.isArray(data.items) || data.items.length === 0) {
      throw new AppError('Debe indicar al menos un ítem a devolver');
    }

    // Cantidad ya devuelta por cada saleItem (sumando devoluciones previas).
    const alreadyReturned = new Map();
    for (const ret of sale.returns) {
      for (const ri of ret.items) {
        alreadyReturned.set(ri.saleItemId, (alreadyReturned.get(ri.saleItemId) || 0) + ri.quantity);
      }
    }

    const saleItemMap = new Map(sale.items.map((i) => [i.id, i]));

    const returnItems = data.items
      .map((item) => {
        const saleItemId = Number(item.saleItemId);
        const quantity = Number(item.quantity);
        const saleItem = saleItemMap.get(saleItemId);

        if (!saleItem) throw new AppError('Ítem de venta inválido');
        if (!Number.isInteger(quantity) || quantity < 0) {
          throw new AppError('Cantidad a devolver inválida');
        }
        if (quantity === 0) return null;

        const returnable = saleItem.quantity - (alreadyReturned.get(saleItemId) || 0);
        if (quantity > returnable) {
          throw new AppError(`No se puede devolver más de lo vendido (disponible: ${returnable})`);
        }

        const price = Number(saleItem.price);
        return { saleItemId, productId: saleItem.productId, quantity, subtotal: Number((price * quantity).toFixed(2)) };
      })
      .filter(Boolean);

    if (returnItems.length === 0) {
      throw new AppError('Debe indicar al menos un ítem a devolver');
    }

    const total = Number(returnItems.reduce((acc, i) => acc + i.subtotal, 0).toFixed(2));

    // ¿La venta queda totalmente devuelta? (unidades devueltas == unidades vendidas)
    const totalSold = sale.items.reduce((acc, i) => acc + i.quantity, 0);
    const totalReturnedPrev = [...alreadyReturned.values()].reduce((acc, q) => acc + q, 0);
    const totalReturnedNow = returnItems.reduce((acc, i) => acc + i.quantity, 0);
    const fullyReturned = totalReturnedPrev + totalReturnedNow >= totalSold;

    // Transacción: repone stock de lo devuelto, registra la devolución y actualiza el estado.
    return prisma.$transaction(async (tx) => {
      for (const item of returnItems) {
        const updated = await tx.product.update({
          where: { id: item.productId },
          data: { stock: { increment: item.quantity } },
        });
        await recordInventoryMovement(tx, {
          productId: item.productId,
          userId,
          type: 'RETURN',
          quantity: item.quantity,
          stockAfter: updated.stock,
          reason: `Devolución venta V-${String(saleId).padStart(4, '0')}`,
        });
      }

      await tx.saleReturn.create({
        data: {
          saleId,
          userId,
          total,
          reason: data.reason || null,
          items: {
            create: returnItems.map((i) => ({
              saleItemId: i.saleItemId,
              quantity: i.quantity,
              subtotal: i.subtotal,
            })),
          },
        },
      });

      await registerCashMovement(tx, { sale, type: 'RETURN', amount: total, userId, description: 'Devolución de venta' });

      return tx.sale.update({
        where: { id: saleId },
        data: { status: fullyReturned ? 'RETURNED' : 'PARTIALLY_RETURNED' },
        include: saleInclude,
      });
    });
  },
};
