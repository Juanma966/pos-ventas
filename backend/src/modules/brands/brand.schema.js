import { z } from 'zod';

export const createBrandSchema = z.object({
  name: z.string().min(1, 'El nombre es requerido').max(80),
  description: z.string().max(300).optional().or(z.literal('')),
  active: z.boolean().optional(),
});

export const updateBrandSchema = createBrandSchema.partial();
