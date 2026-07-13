import { z } from 'zod';

export const createCustomerSchema = z.object({
  name: z.string().min(1, 'El nombre es requerido').max(100),
  email: z.string().email('Email inválido').optional().or(z.literal('')),
  phone: z.string().max(30).optional().or(z.literal('')),
  document: z.string().max(20).optional().or(z.literal('')),
  address: z.string().max(200).optional().or(z.literal('')),
  creditLimit: z.coerce.number().min(0, 'El límite no puede ser negativo'),
  notes: z.string().max(500).optional().or(z.literal('')),
  active: z.boolean(),
});

export const updateCustomerSchema = createCustomerSchema.partial();
