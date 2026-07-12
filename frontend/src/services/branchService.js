import api from './api';

export const branchService = {
  getAll: (params) => api.get('/branches', { params }).then((r) => r.data.data),
  create: (data) => api.post('/branches', data).then((r) => r.data.data),
  update: (id, data) => api.put(`/branches/${id}`, data).then((r) => r.data.data),
  remove: (id) => api.delete(`/branches/${id}`).then((r) => r.data),
};
