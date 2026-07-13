import { z } from 'zod';

export const updateCompanySchema = z.object({
  name: z.string().min(1, 'El nombre es requerido').max(100),
  address: z.string().max(200).optional().or(z.literal('')),
  phone: z.string().max(30).optional().or(z.literal('')),
  taxId: z.string().max(20).optional().or(z.literal('')),
  ticketFooter: z.string().max(200).optional().or(z.literal('')),
});
