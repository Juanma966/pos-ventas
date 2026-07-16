// Tests de autenticación: login (válido, validación, credenciales) y /me.
import './helpers/env.js';
import { describe, test, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { startTestServer, USERS } from './helpers/testServer.js';

let srv;
before(async () => {
  srv = await startTestServer();
});
after(async () => {
  await srv.close();
});

describe('Auth', () => {
  test('login válido devuelve token y datos del usuario', async () => {
    const res = await srv.api('POST', '/auth/login', { body: USERS.admin });
    assert.equal(res.status, 200);
    assert.ok(res.data.accessToken, 'debe devolver un accessToken');
    assert.equal(res.data.user.email, USERS.admin.email);
    assert.equal(res.data.user.role, 'admin');
  });

  test('login con email malformado responde 400 (validación Zod)', async () => {
    const res = await srv.api('POST', '/auth/login', { body: { email: 'no-es-un-email', password: 'x' } });
    assert.equal(res.status, 400);
  });

  test('login sin contraseña responde 400 (validación Zod)', async () => {
    const res = await srv.api('POST', '/auth/login', { body: { email: 'admin@pos.com' } });
    assert.equal(res.status, 400);
  });

  test('login con contraseña incorrecta responde 401', async () => {
    const res = await srv.api('POST', '/auth/login', { body: { email: 'admin@pos.com', password: 'incorrecta' } });
    assert.equal(res.status, 401);
  });

  test('GET /auth/me sin token responde 401', async () => {
    const res = await srv.api('GET', '/auth/me');
    assert.equal(res.status, 401);
  });

  test('GET /auth/me con token devuelve el usuario logueado', async () => {
    const token = await srv.login(USERS.cajero);
    const res = await srv.api('GET', '/auth/me', { token });
    assert.equal(res.status, 200);
    assert.equal(res.data.user.email, USERS.cajero.email);
    assert.equal(res.data.user.role, 'cajero');
  });
});
