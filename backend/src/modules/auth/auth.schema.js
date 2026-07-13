import { z } from 'zod';

export const loginSchema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().min(1, 'La contraseña es requerida'),
});

export const updateProfileSchema = z.object({
  name: z.string().min(1, 'El nombre no puede estar vacío').max(100).optional(),
  // avatar: data URL base64 (string larga) o null para quitarla
  avatar: z.string().nullable().optional(),
});
