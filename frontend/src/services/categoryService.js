import api from './api';

export const categoryService = {
  getAll: () => api.get('/categories').then((r) => r.data.data),
  create: (data) => api.post('/categories', data).then((r) => r.data.data),
  update: (id, data) => api.put(`/categories/${id}`, data).then((r) => r.data.data),
  remove: (id) => api.delete(`/categories/${id}`).then((r) => r.data),
};
