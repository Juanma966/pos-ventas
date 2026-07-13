import { z } from 'zod';

export const createFixedExpenseSchema = z.object({
  name: z.string().min(1, 'El nombre es requerido').max(100),
  category: z.enum(['ALQUILER', 'SERVICIO', 'CREDITO', 'OTRO'], { message: 'Categoría inválida' }),
  amount: z.coerce.number().min(0, 'El monto no puede ser negativo'),
  active: z.boolean().optional(),
});

export const updateFixedExpenseSchema = createFixedExpenseSchema.partial();
