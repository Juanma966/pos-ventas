import { z } from 'zod';

export const createSaleSchema = z.object({
  paymentMethod: z.enum(['EFECTIVO', 'TARJETA', 'TRANSFERENCIA'], { message: 'Método de pago inválido' }),
  discount: z.coerce.number().min(0, 'El descuento no puede ser negativo').optional(),
  customerId: z.coerce.number().int().positive().nullable().optional(),
  notes: z.string().max(500).optional().or(z.literal('')),
  items: z
    .array(
      z.object({
        productId: z.coerce.number().int().positive(),
        quantity: z.coerce.number().int().positive('La cantidad debe ser mayor a 0'),
      })
    )
    .min(1, 'La venta debe tener al menos un producto'),
});

export const createReturnSchema = z.object({
  reason: z.string().max(300).optional().or(z.literal('')),
  items: z
    .array(
      z.object({
        saleItemId: z.coerce.number().int().positive(),
        quantity: z.coerce.number().int().min(0),
      })
    )
    .min(1, 'Debe indicar al menos un ítem a devolver'),
});
