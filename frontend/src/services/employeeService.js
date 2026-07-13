import api from './api';

export const employeeService = {
  getAll: (params) => api.get('/employees', { params }).then((r) => r.data.data),
  getById: (id) => api.get(`/employees/${id}`).then((r) => r.data.data),
  create: (data) => api.post('/employees', data).then((r) => r.data.data),
  update: (id, data) => api.put(`/employees/${id}`, data).then((r) => r.data.data),
  remove: (id) => api.delete(`/employees/${id}`).then((r) => r.data),
  addMovement: (id, data) => api.post(`/employees/${id}/movements`, data).then((r) => r.data.data),
  removeMovement: (id, movementId) => api.delete(`/employees/${id}/movements/${movementId}`).then((r) => r.data.data),
};
