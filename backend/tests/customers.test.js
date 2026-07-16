// Tests del detalle de cliente: estadísticas (total gastado, compras, ticket
// promedio) e historial. Reglas: las ventas anuladas no cuentan y las
// devoluciones restan del total gastado.
import './helpers/env.js';
import { describe, test, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { startTestServer, USERS } from './helpers/testServer.js';

let srv;
const tokens = {};
let customer;
let product;

const getDetail = async () => {
  const res = await srv.api('GET', `/customers/${customer.id}`, { token: tokens.admin });
  assert.equal(res.status, 200);
  return res.data;
};

before(async () => {
  srv = await startTestServer();
  tokens.admin = await srv.login(USERS.admin);
  tokens.cajero = await srv.login(USERS.cajero);

  const custRes = await srv.api('POST', '/customers', {
    token: tokens.admin,
    body: { name: `Cliente Test Stats ${Date.now()}`, creditLimit: 0, active: true }
  });
  assert.equal(custRes.status, 201, 'setup: el cliente debe crearse');
  customer = custRes.data;

  const categories = await srv.api('GET', '/categories', { token: tokens.admin });
  const prodRes = await srv.api('POST', '/products', {
    token: tokens.admin,
    body: { name: `Producto Test Clientes ${Date.now()}`, price: 100, cost: 50, stock: 20, categoryId: categories.data[0].id }
  });
  product = prodRes.data;
});
after(async () => {
  await srv.close();
});

const sell = (quantity) =>
  srv.api('POST', '/sales', {
    token: tokens.cajero,
    body: { paymentMethod: 'TARJETA', customerId: customer.id, items: [{ productId: product.id, quantity }] }
  });

describe('Detalle de cliente', () => {
  test('cliente nuevo: estadísticas en cero e historial vacío', async () => {
    const detail = await getDetail();
    assert.equal(detail.stats.salesCount, 0);
    assert.equal(detail.stats.totalSpent, 0);
    assert.equal(detail.stats.avgTicket, 0);
    assert.equal(detail.stats.lastSaleAt, null);
    assert.deepEqual(detail.recentSales, []);
  });

  test('las ventas suman al total gastado', async () => {
    await sell(2); // $200
    await sell(3); // $300
    const detail = await getDetail();
    assert.equal(detail.stats.salesCount, 2);
    assert.equal(detail.stats.totalSpent, 500);
    assert.equal(detail.stats.avgTicket, 250);
    assert.ok(detail.stats.lastSaleAt, 'debe registrar la fecha de la última compra');
    assert.equal(detail.recentSales.length, 2);
  });

  test('una venta anulada no cuenta en las estadísticas (pero sí en el historial)', async () => {
    const saleRes = await sell(1); // $100, después se anula
    await srv.api('POST', `/sales/${saleRes.data.id}/cancel`, { token: tokens.cajero });

    const detail = await getDetail();
    assert.equal(detail.stats.salesCount, 2, 'la anulada no suma como compra');
    assert.equal(detail.stats.totalSpent, 500, 'la anulada no suma al total');
    assert.equal(detail.recentSales.length, 3, 'el historial sí la muestra');
    assert.ok(detail.recentSales.some((s) => s.status === 'CANCELLED'));
  });

  test('una devolución resta del total gastado', async () => {
    // De la venta de 3 unidades se devuelve 1 ($100): total 500 -> 400.
    const detail = await getDetail();
    const saleWith3 = detail.recentSales.find((s) => Number(s.total) === 300);
    const full = await srv.api('GET', `/sales/${saleWith3.id}`, { token: tokens.admin });

    const returnRes = await srv.api('POST', `/sales/${saleWith3.id}/return`, {
      token: tokens.cajero,
      body: { items: [{ saleItemId: full.data.items[0].id, quantity: 1 }] }
    });
    assert.equal(returnRes.status, 201, JSON.stringify(returnRes.body));

    const updated = await getDetail();
    assert.equal(updated.stats.totalSpent, 400);
    assert.equal(updated.stats.salesCount, 2, 'la devolución no cambia la cantidad de compras');
  });
});
