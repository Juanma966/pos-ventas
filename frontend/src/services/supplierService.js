import api from './api';

export const supplierService = {
  getAll: (params) => api.get('/suppliers', { params }).then((r) => r.data.data),
  getById: (id) => api.get(`/suppliers/${id}`).then((r) => r.data.data),
  create: (data) => api.post('/suppliers', data).then((r) => r.data.data),
  update: (id, data) => api.put(`/suppliers/${id}`, data).then((r) => r.data.data),
  remove: (id) => api.delete(`/suppliers/${id}`).then((r) => r.data),
};
