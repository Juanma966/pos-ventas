// Tests del flujo de ventas: crear (descuenta stock), stock insuficiente,
// anulación (repone stock) y devolución parcial (repone lo devuelto).
// Se usa TARJETA como método de pago para no depender de una caja abierta.
import './helpers/env.js';
import { describe, test, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { startTestServer, USERS } from './helpers/testServer.js';

let srv;
const tokens = {};
let product; // producto propio de esta suite, con stock conocido

const getStock = async (id) => {
  const res = await srv.api('GET', `/products/${id}`, { token: tokens.admin });
  return res.data.stock;
};

before(async () => {
  srv = await startTestServer();
  tokens.admin = await srv.login(USERS.admin);
  tokens.cajero = await srv.login(USERS.cajero);
  tokens.vendedor = await srv.login(USERS.vendedor);

  // Producto exclusivo para estos tests (stock 10, precio 100).
  const categories = await srv.api('GET', '/categories', { token: tokens.admin });
  const res = await srv.api('POST', '/products', {
    token: tokens.admin,
    body: { name: `Producto Test Ventas ${Date.now()}`, price: 100, cost: 50, stock: 10, categoryId: categories.data[0].id }
  });
  assert.equal(res.status, 201, 'setup: el producto de prueba debe crearse');
  product = res.data;
});
after(async () => {
  await srv.close();
});

describe('Ventas', () => {
  let sale;

  test('el vendedor crea una venta y el stock se descuenta', async () => {
    const res = await srv.api('POST', '/sales', {
      token: tokens.vendedor,
      body: { paymentMethod: 'TARJETA', items: [{ productId: product.id, quantity: 3 }] }
    });
    assert.equal(res.status, 201, JSON.stringify(res.body));
    sale = res.data;
    assert.equal(sale.status, 'COMPLETED');
    assert.equal(Number(sale.total), 300); // 3 x $100
    assert.equal(await getStock(product.id), 7); // 10 - 3
  });

  test('no permite vender más unidades que el stock disponible', async () => {
    const res = await srv.api('POST', '/sales', {
      token: tokens.vendedor,
      body: { paymentMethod: 'TARJETA', items: [{ productId: product.id, quantity: 999 }] }
    });
    assert.equal(res.status, 400);
    assert.equal(await getStock(product.id), 7, 'el stock no debe cambiar si la venta falla');
  });

  test('el cajero anula la venta y el stock se repone', async () => {
    const res = await srv.api('POST', `/sales/${sale.id}/cancel`, { token: tokens.cajero });
    assert.equal(res.status, 200, JSON.stringify(res.body));
    assert.equal(res.data.status, 'CANCELLED');
    assert.equal(await getStock(product.id), 10); // vuelve al original
  });

  test('devolución parcial: repone lo devuelto y marca la venta', async () => {
    // Nueva venta de 4 unidades (stock 10 -> 6)
    const saleRes = await srv.api('POST', '/sales', {
      token: tokens.cajero,
      body: { paymentMethod: 'TARJETA', items: [{ productId: product.id, quantity: 4 }] }
    });
    assert.equal(saleRes.status, 201);
    const sale2 = saleRes.data;

    // Se devuelven 2 de las 4 (stock 6 -> 8)
    const returnRes = await srv.api('POST', `/sales/${sale2.id}/return`, {
      token: tokens.cajero,
      body: { items: [{ saleItemId: sale2.items[0].id, quantity: 2 }] }
    });
    assert.equal(returnRes.status, 201, JSON.stringify(returnRes.body)); // 201: la devolución es un recurso creado
    assert.equal(returnRes.data.status, 'PARTIALLY_RETURNED');
    assert.equal(await getStock(product.id), 8);
  });

  test('el vendedor NO puede anular ventas (403)', async () => {
    const res = await srv.api('POST', `/sales/${sale.id}/cancel`, { token: tokens.vendedor });
    assert.equal(res.status, 403);
  });
});
