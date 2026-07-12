import api from './api';

export const reportService = {
  getSales: (params) => api.get('/reports/sales', { params }).then((r) => r.data.data),
  getDashboard: () => api.get('/reports/dashboard').then((r) => r.data.data),
};
