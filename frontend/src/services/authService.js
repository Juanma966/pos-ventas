import api from './api';

export const authService = {
  async login(email, password) {
    const { data } = await api.post('/auth/login', { email, password });
    return { user: data.data.user, token: data.data.accessToken };
  },

  async refresh() {
    const { data } = await api.post('/auth/refresh');
    return data.data.accessToken;
  },

  async logout() {
    await api.post('/auth/logout');
  },

  async getMe() {
    const { data } = await api.get('/auth/me');
    return data.data.user;
  },
};
