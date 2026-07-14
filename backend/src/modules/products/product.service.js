import { PrismaClient } from '@prisma/client';
import { AppError } from '../../middleware/error.middleware.js';

const prisma = new PrismaClient();

const productInclude = {
  category: { select: { id: true, name: true } },
  brand: { select: { id: true, name: true } },
};

export const productService = {
  async findAll({ search = '', categoryId, active, page = 1, limit = 20 } = {}) {
    const where = {
      ...(search && {
        OR: [
          { name: { contains: search, mode: 'insensitive' } },
          { barcode: { contains: search, mode: 'insensitive' } },
        ],
      }),
      ...(categoryId && { categoryId: Number(categoryId) }),
      ...(active !== undefined && { active: active === 'true' }),
    };

    const [total, items] = await Promise.all([
      prisma.product.count({ where }),
      prisma.product.findMany({
        where,
        include: productInclude,
        orderBy: { name: 'asc' },
        skip: (page - 1) * limit,
        take: Number(limit),
      }),
    ]);

    return { items, total, page: Number(page), limit: Number(limit), pages: Math.ceil(total / limit) };
  },

  async findById(id) {
    const product = await prisma.product.findUnique({ where: { id }, include: productInclude });
    if (!product) throw new AppError('Producto no encontrado', 404);
    return product;
  },

  async create(data) {
    if (data.barcode) {
      const exists = await prisma.product.findUnique({ where: { barcode: data.barcode } });
      if (exists) throw new AppError('Ya existe un producto con ese código de barras');
    }
    return prisma.product.create({
      data: {
        name: data.name,
        description: data.description,
        image: data.image || null,
        barcode: data.barcode || null,
        price: data.price,
        cost: data.cost,
        stock: data.stock ?? 0,
        minStock: data.minStock ?? 5,
        active: data.active ?? true,
        categoryId: Number(data.categoryId),
        brandId: data.brandId ? Number(data.brandId) : null,
      },
      include: productInclude,
    });
  },

  async update(id, data) {
    await productService.findById(id);
    if (data.barcode) {
      const exists = await prisma.product.findFirst({ where: { barcode: data.barcode, NOT: { id } } });
      if (exists) throw new AppError('Ya existe un producto con ese código de barras');
    }
    return prisma.product.update({
      where: { id },
      data: {
        ...(data.name !== undefined && { name: data.name }),
        ...(data.description !== undefined && { description: data.description }),
        ...(data.image !== undefined && { image: data.image || null }),
        ...(data.barcode !== undefined && { barcode: data.barcode || null }),
        ...(data.price !== undefined && { price: data.price }),
        ...(data.cost !== undefined && { cost: data.cost }),
        ...(data.stock !== undefined && { stock: Number(data.stock) }),
        ...(data.minStock !== undefined && { minStock: Number(data.minStock) }),
        ...(data.active !== undefined && { active: data.active }),
        ...(data.categoryId !== undefined && { categoryId: Number(data.categoryId) }),
        ...(data.brandId !== undefined && { brandId: data.brandId ? Number(data.brandId) : null }),
      },
      include: productInclude,
    });
  },

  async remove(id) {
    await productService.findById(id);
    return prisma.product.delete({ where: { id } });
  },
};
