import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const DEFAULT_COMPANY = {
  name: 'POS Ventas',
  address: null,
  phone: null,
  taxId: null,
  ticketFooter: '¡Gracias por su compra!',
};

export const settingsService = {
  // Devuelve la empresa (fila única). La crea con valores por defecto si no existe.
  async getCompany() {
    const existing = await prisma.company.findFirst({ orderBy: { id: 'asc' } });
    if (existing) return existing;
    return prisma.company.create({ data: DEFAULT_COMPANY });
  },

  async updateCompany(data) {
    const company = await settingsService.getCompany();
    return prisma.company.update({
      where: { id: company.id },
      data: {
        name: data.name,
        address: data.address || null,
        phone: data.phone || null,
        taxId: data.taxId || null,
        ticketFooter: data.ticketFooter || null,
      },
    });
  },
};
