import api from './api';

export const settingsService = {
  getCompany: () => api.get('/settings/company').then((r) => r.data.data),
  updateCompany: (data) => api.put('/settings/company', data).then((r) => r.data.data),
};
