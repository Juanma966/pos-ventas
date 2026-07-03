// TODO: reemplazar con llamadas reales al backend en Fase 2B
// import api from './api';

const MOCK_USER = {
  id: 1,
  name: 'Administrador',
  email: 'admin@pos.com',
  role: 'admin'
};

const MOCK_TOKEN = 'mock-jwt-token-dev';

export const authService = {
  async login(email, password) {
    await new Promise((r) => setTimeout(r, 600)); // simula latencia
    if (email === 'admin@pos.com' && password === 'admin123') {
      return { user: MOCK_USER, token: MOCK_TOKEN };
    }
    throw new Error('Credenciales incorrectas');
  },

  async logout() {
    // await api.post('/auth/logout');
  },

  async getMe() {
    // return api.get('/auth/me').then((r) => r.data);
    const token = localStorage.getItem('access_token');
    if (token === MOCK_TOKEN) return MOCK_USER;
    throw new Error('Sesión inválida');
  }
};
