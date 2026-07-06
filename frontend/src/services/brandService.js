import api from './api';

export const brandService = {
  getAll: () => api.get('/brands').then((r) => r.data.data),
  create: (data) => api.post('/brands', data).then((r) => r.data.data),
  update: (id, data) => api.put(`/brands/${id}`, data).then((r) => r.data.data),
  remove: (id) => api.delete(`/brands/${id}`).then((r) => r.data),
};
