import api from './api';

export const inventoryService = {
  getMovements: (params) => api.get('/inventory', { params }).then((r) => r.data.data),
  createAdjustment: (data) => api.post('/inventory/adjustments', data).then((r) => r.data.data),
};
