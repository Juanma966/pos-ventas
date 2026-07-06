import api from './api';

export const purchaseService = {
  getAll: (params) => api.get('/purchases', { params }).then((r) => r.data.data),
  getById: (id) => api.get(`/purchases/${id}`).then((r) => r.data.data),
  create: (data) => api.post('/purchases', data).then((r) => r.data.data),
  update: (id, data) => api.put(`/purchases/${id}`, data).then((r) => r.data.data),
  receive: (id) => api.post(`/purchases/${id}/receive`).then((r) => r.data.data),
  cancel: (id) => api.post(`/purchases/${id}/cancel`).then((r) => r.data.data),
  remove: (id) => api.delete(`/purchases/${id}`).then((r) => r.data),
};
