import api from './api';

export const fixedExpenseService = {
  getAll: (params) => api.get('/fixed-expenses', { params }).then((r) => r.data.data),
  getSummary: () => api.get('/fixed-expenses/summary').then((r) => r.data.data),
  create: (data) => api.post('/fixed-expenses', data).then((r) => r.data.data),
  update: (id, data) => api.put(`/fixed-expenses/${id}`, data).then((r) => r.data.data),
  remove: (id) => api.delete(`/fixed-expenses/${id}`).then((r) => r.data),
};
