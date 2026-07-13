import { z } from 'zod';

export const openCashSchema = z.object({
  openingAmount: z.coerce.number().min(0, 'El monto de apertura no puede ser negativo'),
  notes: z.string().max(300).optional().or(z.literal('')),
});

export const cashMovementSchema = z.object({
  type: z.enum(['INCOME', 'EXPENSE'], { message: 'Tipo de movimiento inválido' }),
  amount: z.coerce.number().positive('El monto debe ser mayor a 0'),
  description: z.string().max(300).optional().or(z.literal('')),
});

export const closeCashSchema = z.object({
  countedAmount: z.coerce.number().min(0, 'El monto contado no puede ser negativo'),
  notes: z.string().max(300).optional().or(z.literal('')),
});
