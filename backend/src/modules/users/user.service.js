import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import { AppError } from '../../middleware/error.middleware.js';

const prisma = new PrismaClient();

// Nunca exponer el hash de la contraseña.
const userSelect = {
  id: true,
  name: true,
  email: true,
  active: true,
  createdAt: true,
  role: { select: { id: true, name: true, description: true } },
};

export const userService = {
  async findAll({ search = '' } = {}) {
    const where = search
      ? { OR: [{ name: { contains: search, mode: 'insensitive' } }, { email: { contains: search, mode: 'insensitive' } }] }
      : {};
    return prisma.user.findMany({ where, select: userSelect, orderBy: { name: 'asc' } });
  },

  async getRoles() {
    return prisma.role.findMany({ select: { id: true, name: true, description: true }, orderBy: { id: 'asc' } });
  },

  async create(data) {
    if (!data.name || !data.email || !data.password) {
      throw new AppError('Nombre, email y contraseña son requeridos');
    }
    if (String(data.password).length < 6) {
      throw new AppError('La contraseña debe tener al menos 6 caracteres');
    }
    const exists = await prisma.user.findUnique({ where: { email: data.email } });
    if (exists) throw new AppError('Ya existe un usuario con ese email');

    const role = await prisma.role.findUnique({ where: { id: Number(data.roleId) } });
    if (!role) throw new AppError('Rol inválido');

    const password = await bcrypt.hash(data.password, 10);
    return prisma.user.create({
      data: { name: data.name, email: data.email, password, roleId: role.id, active: data.active ?? true },
      select: userSelect,
    });
  },

  async update(id, data) {
    const user = await prisma.user.findUnique({ where: { id } });
    if (!user) throw new AppError('Usuario no encontrado', 404);

    if (data.email && data.email !== user.email) {
      const exists = await prisma.user.findFirst({ where: { email: data.email, NOT: { id } } });
      if (exists) throw new AppError('Ya existe un usuario con ese email');
    }
    if (data.roleId) {
      const role = await prisma.role.findUnique({ where: { id: Number(data.roleId) } });
      if (!role) throw new AppError('Rol inválido');
    }

    const patch = {
      ...(data.name !== undefined && { name: data.name }),
      ...(data.email !== undefined && { email: data.email }),
      ...(data.roleId !== undefined && { roleId: Number(data.roleId) }),
      ...(data.active !== undefined && { active: data.active }),
    };

    if (data.password) {
      if (String(data.password).length < 6) throw new AppError('La contraseña debe tener al menos 6 caracteres');
      patch.password = await bcrypt.hash(data.password, 10);
    }

    return prisma.user.update({ where: { id }, data: patch, select: userSelect });
  },

  // Activar/desactivar (no se borran usuarios porque tienen ventas/compras asociadas).
  async setActive(id, active, currentUserId) {
    const user = await prisma.user.findUnique({ where: { id } });
    if (!user) throw new AppError('Usuario no encontrado', 404);
    if (id === currentUserId && !active) {
      throw new AppError('No podés desactivar tu propia cuenta');
    }
    return prisma.user.update({ where: { id }, data: { active }, select: userSelect });
  },
};
