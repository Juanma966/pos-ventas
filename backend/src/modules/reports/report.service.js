import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Ventas que cuentan para facturación: todas menos las anuladas.
const VALID_SALE_STATUS = ['COMPLETED', 'PARTIALLY_RETURNED', 'RETURNED'];

const startOfDay = (d) => { const x = new Date(d); x.setHours(0, 0, 0, 0); return x; };
const endOfDay = (d) => { const x = new Date(d); x.setHours(23, 59, 59, 999); return x; };
const ymd = (d) => {
  const x = new Date(d);
  return `${x.getFullYear()}-${String(x.getMonth() + 1).padStart(2, '0')}-${String(x.getDate()).padStart(2, '0')}`;
};

// Resuelve el rango [from, to]; por defecto, últimos 30 días.
function resolveRange(from, to) {
  const toDate = to ? endOfDay(to) : endOfDay(new Date());
  const fromDate = from ? startOfDay(from) : startOfDay(new Date(toDate.getTime() - 29 * 24 * 60 * 60 * 1000));
  return { fromDate, toDate };
}

// Rellena la serie diaria [fromDate, toDate] con los totales del mapa (0 si falta).
function buildDailySeries(dailyMap, fromDate, toDate) {
  const daily = [];
  for (let d = new Date(fromDate); d <= toDate; d.setDate(d.getDate() + 1)) {
    const key = ymd(d);
    daily.push({ date: key, total: Number((dailyMap[key] || 0).toFixed(2)) });
  }
  return daily;
}

export const reportService = {
  // Reporte de ventas en un rango de fechas [from, to] (inclusive).
  async salesReport({ from, to } = {}) {
    const { fromDate, toDate } = resolveRange(from, to);

    const sales = await prisma.sale.findMany({
      where: { createdAt: { gte: fromDate, lte: toDate }, status: { in: VALID_SALE_STATUS } },
      include: { items: { include: { product: { select: { id: true, name: true } } } } },
    });

    const returns = await prisma.saleReturn.aggregate({
      _sum: { total: true },
      where: { createdAt: { gte: fromDate, lte: toDate } },
    });

    let grossRevenue = 0;
    const byPaymentMethod = {};
    const dailyMap = {};
    const productMap = {};

    for (const sale of sales) {
      const total = Number(sale.total);
      grossRevenue += total;

      byPaymentMethod[sale.paymentMethod] = (byPaymentMethod[sale.paymentMethod] || 0) + total;

      const day = ymd(sale.createdAt);
      dailyMap[day] = (dailyMap[day] || 0) + total;

      for (const item of sale.items) {
        const key = item.productId;
        if (!productMap[key]) productMap[key] = { productId: key, name: item.product?.name ?? `#${key}`, quantity: 0, revenue: 0 };
        productMap[key].quantity += item.quantity;
        productMap[key].revenue += Number(item.subtotal);
      }
    }

    const returnsTotal = Number(returns._sum.total || 0);
    const salesCount = sales.length;

    const daily = buildDailySeries(dailyMap, fromDate, toDate);

    const topProducts = Object.values(productMap)
      .sort((a, b) => b.quantity - a.quantity)
      .slice(0, 10)
      .map((p) => ({ ...p, revenue: Number(p.revenue.toFixed(2)) }));

    return {
      range: { from: ymd(fromDate), to: ymd(toDate) },
      salesCount,
      grossRevenue: Number(grossRevenue.toFixed(2)),
      returnsTotal: Number(returnsTotal.toFixed(2)),
      netRevenue: Number((grossRevenue - returnsTotal).toFixed(2)),
      avgTicket: salesCount ? Number((grossRevenue / salesCount).toFixed(2)) : 0,
      byPaymentMethod: Object.entries(byPaymentMethod).map(([method, total]) => ({ method, total: Number(total.toFixed(2)) })),
      daily,
      topProducts,
    };
  },

  // Reporte de compras recibidas en un rango (por fecha de recepción).
  async purchasesReport({ from, to } = {}) {
    const { fromDate, toDate } = resolveRange(from, to);

    const purchases = await prisma.purchase.findMany({
      where: { status: 'RECEIVED', receivedAt: { gte: fromDate, lte: toDate } },
      include: {
        supplier: { select: { id: true, name: true } },
        items: { include: { product: { select: { id: true, name: true } } } },
      },
    });

    let totalPurchased = 0;
    const dailyMap = {};
    const supplierMap = {};
    const productMap = {};

    for (const purchase of purchases) {
      const total = Number(purchase.total);
      totalPurchased += total;

      const day = ymd(purchase.receivedAt);
      dailyMap[day] = (dailyMap[day] || 0) + total;

      const sid = purchase.supplierId;
      if (!supplierMap[sid]) supplierMap[sid] = { supplierId: sid, name: purchase.supplier?.name ?? `#${sid}`, count: 0, total: 0 };
      supplierMap[sid].count += 1;
      supplierMap[sid].total += total;

      for (const item of purchase.items) {
        const key = item.productId;
        if (!productMap[key]) productMap[key] = { productId: key, name: item.product?.name ?? `#${key}`, quantity: 0, total: 0 };
        productMap[key].quantity += item.quantity;
        productMap[key].total += Number(item.subtotal);
      }
    }

    return {
      range: { from: ymd(fromDate), to: ymd(toDate) },
      purchasesCount: purchases.length,
      totalPurchased: Number(totalPurchased.toFixed(2)),
      daily: buildDailySeries(dailyMap, fromDate, toDate),
      topSuppliers: Object.values(supplierMap)
        .sort((a, b) => b.total - a.total)
        .slice(0, 10)
        .map((s) => ({ ...s, total: Number(s.total.toFixed(2)) })),
      topProducts: Object.values(productMap)
        .sort((a, b) => b.quantity - a.quantity)
        .slice(0, 10)
        .map((p) => ({ ...p, revenue: Number(p.total.toFixed(2)) })),
    };
  },

  // Reporte de caja: sesiones cerradas y movimientos en un rango.
  async cashReport({ from, to } = {}) {
    const { fromDate, toDate } = resolveRange(from, to);

    const [sessions, movements] = await Promise.all([
      prisma.cashSession.findMany({
        where: { status: 'CLOSED', closedAt: { gte: fromDate, lte: toDate } },
        include: { user: { select: { id: true, name: true } } },
        orderBy: { closedAt: 'desc' },
      }),
      prisma.cashMovement.findMany({
        where: { createdAt: { gte: fromDate, lte: toDate } },
        select: { type: true, amount: true },
      }),
    ]);

    const totalsByType = { SALE: 0, INCOME: 0, EXPENSE: 0, RETURN: 0 };
    for (const m of movements) {
      totalsByType[m.type] = (totalsByType[m.type] || 0) + Number(m.amount);
    }

    const totalDifference = sessions.reduce((acc, s) => acc + Number(s.difference || 0), 0);

    return {
      range: { from: ymd(fromDate), to: ymd(toDate) },
      sessionsCount: sessions.length,
      totalsByType: Object.fromEntries(Object.entries(totalsByType).map(([k, v]) => [k, Number(v.toFixed(2))])),
      totalDifference: Number(totalDifference.toFixed(2)),
      sessions: sessions.map((s) => ({
        id: s.id,
        user: s.user?.name ?? '—',
        openedAt: s.openedAt,
        closedAt: s.closedAt,
        openingAmount: Number(s.openingAmount),
        expectedAmount: s.expectedAmount != null ? Number(s.expectedAmount) : null,
        closingAmount: s.closingAmount != null ? Number(s.closingAmount) : null,
        difference: s.difference != null ? Number(s.difference) : null,
      })),
    };
  },

  // Datos del dashboard con la misma forma que consumía el mock del frontend.
  async dashboard() {
    const now = new Date();
    const todayStart = startOfDay(now);
    const todayEnd = endOfDay(now);
    const yStart = startOfDay(new Date(now.getTime() - 24 * 60 * 60 * 1000));
    const yEnd = endOfDay(new Date(now.getTime() - 24 * 60 * 60 * 1000));
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const lastYearStart = new Date(now.getFullYear() - 1, 0, 1);

    const variacion = (curr, prev) => {
      if (!prev) return curr > 0 ? 100 : 0;
      return Number((((curr - prev) / prev) * 100).toFixed(1));
    };

    const [salesToday, salesYesterday, products, clientesNuevosMes, salesForSeries, ultimas] = await Promise.all([
      prisma.sale.findMany({ where: { createdAt: { gte: todayStart, lte: todayEnd }, status: { in: VALID_SALE_STATUS } }, select: { total: true } }),
      prisma.sale.findMany({ where: { createdAt: { gte: yStart, lte: yEnd }, status: { in: VALID_SALE_STATUS } }, select: { total: true } }),
      prisma.product.findMany({ where: { active: true }, select: { stock: true, minStock: true } }),
      prisma.customer.count({ where: { createdAt: { gte: monthStart } } }),
      prisma.sale.findMany({ where: { createdAt: { gte: lastYearStart }, status: { in: VALID_SALE_STATUS } }, select: { total: true, createdAt: true } }),
      prisma.sale.findMany({
        where: { status: { in: VALID_SALE_STATUS } },
        orderBy: { createdAt: 'desc' },
        take: 5,
        include: { customer: { select: { name: true } }, _count: { select: { items: true } } },
      }),
    ]);

    const sum = (arr) => arr.reduce((acc, s) => acc + Number(s.total), 0);
    const montoHoy = sum(salesToday);
    const montoAyer = sum(salesYesterday);

    const productosBajoStock = products.filter((p) => p.stock <= p.minStock).length;

    // Serie mensual: totales por mes de este año y del anterior.
    const esteAnio = Array(12).fill(0);
    const anioAnterior = Array(12).fill(0);
    for (const s of salesForSeries) {
      const d = new Date(s.createdAt);
      const bucket = d.getFullYear() === now.getFullYear() ? esteAnio : d.getFullYear() === now.getFullYear() - 1 ? anioAnterior : null;
      if (bucket) bucket[d.getMonth()] += Number(s.total);
    }

    return {
      ventasHoy: { monto: Number(montoHoy.toFixed(2)), variacion: variacion(montoHoy, montoAyer) },
      transaccionesHoy: { cantidad: salesToday.length, variacion: variacion(salesToday.length, salesYesterday.length) },
      productosBajoStock,
      clientesNuevosMes,
      ventasMensuales: {
        esteAnio: esteAnio.map((n) => Number(n.toFixed(2))),
        anioAnterior: anioAnterior.map((n) => Number(n.toFixed(2))),
      },
      ultimasVentas: ultimas.map((s) => ({
        id: s.id,
        cliente: s.customer?.name ?? 'Consumidor final',
        monto: Number(s.total),
        items: s._count.items,
        hora: new Date(s.createdAt).toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' }),
      })),
    };
  },
};
