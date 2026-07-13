import { PrismaClient } from '@prisma/client';
import { AppError } from '../../middleware/error.middleware.js';

const prisma = new PrismaClient();

const MOVEMENT_TYPES = ['ADELANTO', 'DESCUENTO', 'PAGO'];

// ADELANTO y PAGO suman a lo "entregado" al empleado; DESCUENTO resta.
function movementSign(type) {
  return type === 'DESCUENTO' ? -1 : 1;
}

// Calcula los totales y el neto entregado a partir de la lista de movimientos.
function computeSummary(movements) {
  const totals = { ADELANTO: 0, DESCUENTO: 0, PAGO: 0 };
  for (const m of movements) totals[m.type] += Number(m.amount);
  const neto = Number((totals.ADELANTO + totals.PAGO - totals.DESCUENTO).toFixed(2));
  return {
    totalAdelantos: Number(totals.ADELANTO.toFixed(2)),
    totalDescuentos: Number(totals.DESCUENTO.toFixed(2)),
    totalPagos: Number(totals.PAGO.toFixed(2)),
    neto,
  };
}

export const employeeService = {
  async findAll({ search = '', active } = {}) {
    const where = {
      ...(search && { OR: [{ name: { contains: search, mode: 'insensitive' } }, { position: { contains: search, mode: 'insensitive' } }] }),
      ...(active !== undefined && { active: active === 'true' }),
    };
    const employees = await prisma.employee.findMany({
      where,
      include: { movements: { select: { type: true, amount: true } } },
      orderBy: { name: 'asc' },
    });
    // Adjunta el neto entregado a cada empleado para el listado.
    return employees.map(({ movements, ...e }) => ({ ...e, neto: computeSummary(movements).neto }));
  },

  async findById(id) {
    const employee = await prisma.employee.findUnique({
      where: { id },
      include: { movements: { orderBy: { id: 'desc' } } },
    });
    if (!employee) throw new AppError('Empleado no encontrado', 404);
    return { ...employee, summary: computeSummary(employee.movements) };
  },

  async create(data) {
    if (!data.name) throw new AppError('El nombre es requerido');
    const salary = Number(data.salary) || 0;
    if (salary < 0) throw new AppError('El sueldo no puede ser negativo');
    return prisma.employee.create({
      data: { name: data.name, position: data.position || null, salary, active: data.active ?? true },
    });
  },

  async update(id, data) {
    await prisma.employee.findUnique({ where: { id } }).then((e) => { if (!e) throw new AppError('Empleado no encontrado', 404); });
    if (data.salary !== undefined && Number(data.salary) < 0) throw new AppError('El sueldo no puede ser negativo');
    return prisma.employee.update({
      where: { id },
      data: {
        ...(data.name !== undefined && { name: data.name }),
        ...(data.position !== undefined && { position: data.position || null }),
        ...(data.salary !== undefined && { salary: Number(data.salary) }),
        ...(data.active !== undefined && { active: data.active }),
      },
    });
  },

  async remove(id) {
    await prisma.employee.findUnique({ where: { id } }).then((e) => { if (!e) throw new AppError('Empleado no encontrado', 404); });
    return prisma.employee.delete({ where: { id } }); // borra sus movimientos (cascade)
  },

  async addMovement(employeeId, data) {
    await employeeService.findById(employeeId);
    if (!MOVEMENT_TYPES.includes(data.type)) throw new AppError('Tipo de movimiento inválido');
    const amount = Number(data.amount);
    if (Number.isNaN(amount) || amount <= 0) throw new AppError('El monto debe ser mayor a 0');
    await prisma.employeeMovement.create({
      data: { employeeId, type: data.type, amount, note: data.note || null },
    });
    return employeeService.findById(employeeId);
  },

  async removeMovement(employeeId, movementId) {
    const movement = await prisma.employeeMovement.findUnique({ where: { id: movementId } });
    if (!movement || movement.employeeId !== employeeId) throw new AppError('Movimiento no encontrado', 404);
    await prisma.employeeMovement.delete({ where: { id: movementId } });
    return employeeService.findById(employeeId);
  },
};
