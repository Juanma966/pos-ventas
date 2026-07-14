import { z } from 'zod';

export const createProductSchema = z.object({
  name: z.string().min(1, 'El nombre es requerido').max(100),
  description: z.string().max(500).optional().or(z.literal('')),
  // Imagen: data URL base64 (string larga) o null para quitarla
  image: z.string().nullable().optional(),
  barcode: z.string().max(50).optional().or(z.literal('')),
  price: z.coerce.number().positive('El precio debe ser mayor a 0'),
  cost: z.coerce.number().min(0, 'El costo no puede ser negativo'),
  stock: z.coerce.number().int().min(0).optional(),
  minStock: z.coerce.number().int().min(0).optional(),
  categoryId: z.coerce.number().int().positive('Seleccioná una categoría'),
  brandId: z.coerce.number().int().positive().nullable().optional(),
  active: z.boolean().optional(),
});

export const updateProductSchema = createProductSchema.partial();
