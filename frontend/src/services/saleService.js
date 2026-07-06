import api from './api';

export const saleService = {
  getAll: (params) => api.get('/sales', { params }).then((r) => r.data.data),
  getById: (id) => api.get(`/sales/${id}`).then((r) => r.data.data),
  create: (data) => api.post('/sales', data).then((r) => r.data.data),
  cancel: (id) => api.post(`/sales/${id}/cancel`).then((r) => r.data.data),
};
