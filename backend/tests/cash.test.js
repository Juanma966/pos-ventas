// Tests de caja: apertura (única), movimientos manuales, movimiento automático
// por venta en efectivo, y cierre con arqueo (diferencia contado vs esperado).
import './helpers/env.js';
import { describe, test, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { startTestServer, USERS } from './helpers/testServer.js';

let srv;
const tokens = {};
let product;

before(async () => {
  srv = await startTestServer();
  tokens.admin = await srv.login(USERS.admin);
  tokens.cajero = await srv.login(USERS.cajero);

  // Producto para la venta en efectivo (precio 100, stock 10).
  const categories = await srv.api('GET', '/categories', { token: tokens.admin });
  const res = await srv.api('POST', '/products', {
    token: tokens.admin,
    body: { name: `Producto Test Caja ${Date.now()}`, price: 100, cost: 50, stock: 10, categoryId: categories.data[0].id }
  });
  product = res.data;
});
after(async () => {
  await srv.close();
});

describe('Caja', () => {
  test('sin caja abierta, /cash/current devuelve null', async () => {
    const res = await srv.api('GET', '/cash/current', { token: tokens.cajero });
    assert.equal(res.status, 200);
    assert.equal(res.data, null);
  });

  test('el cajero abre la caja con $1000 iniciales', async () => {
    const res = await srv.api('POST', '/cash/open', { token: tokens.cajero, body: { openingAmount: 1000 } });
    assert.equal(res.status, 201, JSON.stringify(res.body));
    assert.equal(res.data.status, 'OPEN');
    assert.equal(res.data.balance, 1000);
  });

  test('no se puede abrir una segunda caja', async () => {
    const res = await srv.api('POST', '/cash/open', { token: tokens.admin, body: { openingAmount: 500 } });
    assert.equal(res.status, 400);
  });

  test('una venta en EFECTIVO registra un movimiento automático en la caja', async () => {
    const saleRes = await srv.api('POST', '/sales', {
      token: tokens.cajero,
      body: { paymentMethod: 'EFECTIVO', items: [{ productId: product.id, quantity: 2 }] } // $200
    });
    assert.equal(saleRes.status, 201, JSON.stringify(saleRes.body));

    const session = await srv.api('GET', '/cash/current', { token: tokens.cajero });
    const saleMovement = session.data.movements.find((m) => m.type === 'SALE' && m.saleId === saleRes.data.id);
    assert.ok(saleMovement, 'debe existir un movimiento de tipo SALE asociado a la venta');
    assert.equal(Number(saleMovement.amount), 200);
    assert.equal(session.data.balance, 1200); // 1000 apertura + 200 venta
  });

  test('un egreso manual descuenta del balance', async () => {
    const res = await srv.api('POST', '/cash/movements', {
      token: tokens.cajero,
      body: { type: 'EXPENSE', amount: 300, description: 'Pago proveedor de prueba' }
    });
    assert.equal(res.status, 201, JSON.stringify(res.body));
    assert.equal(res.data.balance, 900); // 1200 - 300
  });

  test('el cierre calcula la diferencia entre contado y esperado', async () => {
    // Esperado: 900. Contamos 850 => diferencia -50 (faltante).
    const res = await srv.api('POST', '/cash/close', { token: tokens.cajero, body: { countedAmount: 850 } });
    assert.equal(res.status, 200, JSON.stringify(res.body));
    assert.equal(res.data.status, 'CLOSED');
    assert.equal(Number(res.data.difference), -50);
  });

  test('cerrada la caja, /cash/current vuelve a ser null', async () => {
    const res = await srv.api('GET', '/cash/current', { token: tokens.cajero });
    assert.equal(res.status, 200);
    assert.equal(res.data, null);
  });
});
