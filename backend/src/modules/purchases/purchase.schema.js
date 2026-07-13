import { z } from 'zod';

// Se usa para crear y para actualizar (ambos reemplazan proveedor + renglones).
export const purchaseSchema = z.object({
  supplierId: z.coerce.number().int().positive('Seleccioná un proveedor'),
  notes: z.string().max(500).optional().or(z.literal('')),
  items: z
    .array(
      z.object({
        productId: z.coerce.number().int().positive(),
        quantity: z.coerce.number().int().positive('La cantidad debe ser mayor a 0'),
        cost: z.coerce.number().min(0, 'El costo no puede ser negativo'),
      })
    )
    .min(1, 'La compra debe tener al menos un producto'),
});
