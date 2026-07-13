import { z } from 'zod';

// La lógica específica por modo (cantidad para ENTRADA/SALIDA, stock contado para
// CONTEO) la valida el service; acá se asegura la forma y los tipos.
export const adjustmentSchema = z.object({
  productId: z.coerce.number().int().positive(),
  mode: z.enum(['ENTRADA', 'SALIDA', 'CONTEO'], { message: 'Tipo de ajuste inválido' }),
  quantity: z.coerce.number().int().optional(),
  countedStock: z.coerce.number().int().optional(),
  reason: z.string().max(300).optional().or(z.literal('')),
});
