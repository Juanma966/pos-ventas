import './env.js';

// Usuarios que crea tests/reset-db.js (uno por rol).
export const USERS = {
  admin: { email: 'admin@pos.com', password: 'admin123' },
  cajero: { email: 'cajero@test.com', password: 'cajero123' },
  vendedor: { email: 'vendedor@test.com', password: 'vendedor123' }
};

// Levanta la app Express real en un puerto libre y devuelve helpers para
// pegarle a la API con fetch. Cada archivo de test arranca su propio server.
export async function startTestServer() {
  // Import dinámico: recién acá se carga la app, con el env de test ya seteado.
  const { default: app } = await import('../../src/app.js');

  const server = await new Promise((resolve) => {
    const s = app.listen(0, () => resolve(s)); // puerto 0 = el SO asigna uno libre
  });
  const baseUrl = `http://127.0.0.1:${server.address().port}`;

  // api('GET', '/products', { token })  |  api('POST', '/sales', { token, body })
  const api = async (method, path, { token, body } = {}) => {
    const res = await fetch(`${baseUrl}/api${path}`, {
      method,
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {})
      },
      body: body !== undefined ? JSON.stringify(body) : undefined
    });
    let json = null;
    try {
      json = await res.json();
    } catch {
      /* respuesta sin cuerpo JSON */
    }
    // data = el payload útil (la API responde { success, data })
    return { status: res.status, body: json, data: json?.data };
  };

  const login = async ({ email, password }) => {
    const res = await api('POST', '/auth/login', { body: { email, password } });
    if (!res.data?.accessToken) {
      throw new Error(`No se pudo loguear ${email}: HTTP ${res.status} ${JSON.stringify(res.body)}`);
    }
    return res.data.accessToken;
  };

  const close = () => new Promise((resolve) => server.close(resolve));

  return { baseUrl, api, login, close };
}
