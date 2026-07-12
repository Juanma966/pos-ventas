import api from './api';

export const reportService = {
  getSales: (params) => api.get('/reports/sales', { params }).then((r) => r.data.data),
  getPurchases: (params) => api.get('/reports/purchases', { params }).then((r) => r.data.data),
  getCash: (params) => api.get('/reports/cash', { params }).then((r) => r.data.data),
  getDashboard: () => api.get('/reports/dashboard').then((r) => r.data.data),
};
