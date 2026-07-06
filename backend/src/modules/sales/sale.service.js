import { PrismaClient } from '@prisma/client';
import { AppError } from '../../middleware/error.middleware.js';

const prisma = new PrismaClient();

const PAYMENT_METHODS = ['EFECTIVO', 'TARJETA', 'TRANSFERENCIA'];

const saleInclude = {
  customer: { select: { id: true, name: true } },
  user: { select: { id: true, name: true } },
  items: {
    include: { product: { select: { id: true, name: true, barcode: true } } },
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
        await tx.product.update({
          where: { id: item.productId },
          data: { stock: { decrement: item.quantity } },
        });
      }

      return sale;
    });
  },

  async cancel(id) {
    const sale = await saleService.findById(id);
    if (sale.status === 'CANCELLED') {
      throw new AppError('La venta ya está anulada');
    }

    // Transacción: repone el stock de cada producto y marca la venta como anulada.
    return prisma.$transaction(async (tx) => {
      for (const item of sale.items) {
        await tx.product.update({
          where: { id: item.productId },
          data: { stock: { increment: item.quantity } },
        });
      }

      return tx.sale.update({
        where: { id },
        data: { status: 'CANCELLED' },
        include: saleInclude,
      });
    });
  },
};
