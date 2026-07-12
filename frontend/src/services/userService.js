import api from './api';

export const userService = {
  getAll: (params) => api.get('/users', { params }).then((r) => r.data.data),
  getRoles: () => api.get('/users/roles').then((r) => r.data.data),
  create: (data) => api.post('/users', data).then((r) => r.data.data),
  update: (id, data) => api.put(`/users/${id}`, data).then((r) => r.data.data),
  setActive: (id, active) => api.patch(`/users/${id}/active`, { active }).then((r) => r.data.data),
};
