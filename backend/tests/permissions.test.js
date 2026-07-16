// Tests de permisos por rol: verifica la matriz enforced en el backend
// (ver backend/src/config/roles.js). Truco: para probar autorización en
// endpoints de escritura sin crear datos, se manda un body inválido — si el
// rol NO puede, recibe 403 (lo corta authorize); si SÍ puede, recibe 400
// (pasó authorize y lo frenó la validación Zod). Así no hay efectos secundarios.
import './helpers/env.js';
import { describe, test, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { startTestServer, USERS } from './helpers/testServer.js';

let srv;
const tokens = {};

before(async () => {
  srv = await startTestServer();
  tokens.admin = await srv.login(USERS.admin);
  tokens.cajero = await srv.login(USERS.cajero);
  tokens.vendedor = await srv.login(USERS.vendedor);
});
after(async () => {
  await srv.close();
});

// Cada caso: [descripción, método, path, body, { admin, cajero, vendedor }]
const CASES = [
  // Lectura general: todos los roles
  ['ver productos', 'GET', '/products', undefined, { admin: 200, cajero: 200, vendedor: 200 }],
  ['ver clientes', 'GET', '/customers', undefined, { admin: 200, cajero: 200, vendedor: 200 }],
  ['ver dashboard', 'GET', '/reports/dashboard', undefined, { admin: 200, cajero: 200, vendedor: 200 }],

  // Solo admin
  ['ver proveedores', 'GET', '/suppliers', undefined, { admin: 200, cajero: 403, vendedor: 403 }],
  ['ver compras', 'GET', '/purchases', undefined, { admin: 200, cajero: 403, vendedor: 403 }],
  ['ver inventario', 'GET', '/inventory', undefined, { admin: 200, cajero: 403, vendedor: 403 }],
  ['ver empleados', 'GET', '/employees', undefined, { admin: 200, cajero: 403, vendedor: 403 }],
  ['ver gastos fijos', 'GET', '/fixed-expenses', undefined, { admin: 200, cajero: 403, vendedor: 403 }],
  ['ver usuarios', 'GET', '/users', undefined, { admin: 200, cajero: 403, vendedor: 403 }],
  ['reporte de ventas', 'GET', '/reports/sales?from=2026-01-01&to=2026-12-31', undefined, { admin: 200, cajero: 403, vendedor: 403 }],

  // Caja: admin + cajero
  ['ver caja actual', 'GET', '/cash/current', undefined, { admin: 200, cajero: 200, vendedor: 403 }],

  // Escrituras (body inválido {} => 400 si está autorizado, 403 si no)
  ['crear producto', 'POST', '/products', {}, { admin: 400, cajero: 403, vendedor: 403 }],
  ['crear categoría', 'POST', '/categories', {}, { admin: 400, cajero: 403, vendedor: 403 }],
  ['crear venta', 'POST', '/sales', {}, { admin: 400, cajero: 400, vendedor: 400 }],
  ['abrir caja', 'POST', '/cash/open', {}, { admin: 400, cajero: 400, vendedor: 403 }],

  // Anular venta inexistente: 404 si está autorizado (pasó authorize), 403 si no
  ['anular venta', 'POST', '/sales/999999/cancel', undefined, { admin: 404, cajero: 404, vendedor: 403 }]
];

describe('Permisos por rol', () => {
  for (const [name, method, path, body, expected] of CASES) {
    for (const role of ['admin', 'cajero', 'vendedor']) {
      test(`${name}: ${role} → ${expected[role]}`, async () => {
        const res = await srv.api(method, path, { token: tokens[role], body });
        assert.equal(res.status, expected[role], `respuesta: ${JSON.stringify(res.body)}`);
      });
    }
  }

  test('sin token, cualquier endpoint responde 401', async () => {
    const res = await srv.api('GET', '/products');
    assert.equal(res.status, 401);
  });
});
