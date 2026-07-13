import { z } from 'zod';

export const createEmployeeSchema = z.object({
  name: z.string().min(1, 'El nombre es requerido').max(100),
  position: z.string().max(80).optional().or(z.literal('')),
  salary: z.coerce.number().min(0, 'El sueldo no puede ser negativo').optional(),
  active: z.boolean().optional(),
});

export const updateEmployeeSchema = createEmployeeSchema.partial();

export const employeeMovementSchema = z.object({
  type: z.enum(['ADELANTO', 'DESCUENTO', 'PAGO'], { message: 'Tipo de movimiento inválido' }),
  amount: z.coerce.number().positive('El monto debe ser mayor a 0'),
  note: z.string().max(300).optional().or(z.literal('')),
});
