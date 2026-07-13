import { z } from 'zod';

export const createBranchSchema = z.object({
  name: z.string().min(1, 'El nombre es requerido').max(100),
  address: z.string().max(200).optional().or(z.literal('')),
  phone: z.string().max(30).optional().or(z.literal('')),
  active: z.boolean().optional(),
});

export const updateBranchSchema = createBranchSchema.partial();
