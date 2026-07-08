import api from './api';

export const cashService = {
  getCurrent: () => api.get('/cash/current').then((r) => r.data.data),
  getSessions: (params) => api.get('/cash/sessions', { params }).then((r) => r.data.data),
  open: (data) => api.post('/cash/open', data).then((r) => r.data.data),
  addMovement: (data) => api.post('/cash/movements', data).then((r) => r.data.data),
  close: (data) => api.post('/cash/close', data).then((r) => r.data.data),
};
