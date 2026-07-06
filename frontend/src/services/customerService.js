import api from './api';

export const customerService = {
  getAll: (params) => api.get('/customers', { params }).then((r) => r.data.data),
  getById: (id) => api.get(`/customers/${id}`).then((r) => r.data.data),
  create: (data) => api.post('/customers', data).then((r) => r.data.data),
  update: (id, data) => api.put(`/customers/${id}`, data).then((r) => r.data.data),
  remove: (id) => api.delete(`/customers/${id}`).then((r) => r.data),
};
