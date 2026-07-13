import { z } from 'zod';

export const createUserSchema = z.object({
  name: z.string().min(1, 'El nombre es requerido').max(100),
  email: z.string().email('Email inválido'),
  password: z.string().min(6, 'La contraseña debe tener al menos 6 caracteres'),
  roleId: z.coerce.number().int().positive('Rol inválido'),
  active: z.boolean().optional(),
});

export const updateUserSchema = z.object({
  name: z.string().min(1, 'El nombre es requerido').max(100).optional(),
  email: z.string().email('Email inválido').optional(),
  password: z.string().min(6, 'La contraseña debe tener al menos 6 caracteres').optional(),
  roleId: z.coerce.number().int().positive('Rol inválido').optional(),
  active: z.boolean().optional(),
});

export const setActiveSchema = z.object({
  active: z.boolean(),
});
