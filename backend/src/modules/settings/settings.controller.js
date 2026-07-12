import { settingsService } from './settings.service.js';

export const settingsController = {
  async getCompany(req, res, next) {
    try {
      const data = await settingsService.getCompany();
      res.json({ success: true, data });
    } catch (err) { next(err); }
  },

  async updateCompany(req, res, next) {
    try {
      const data = await settingsService.updateCompany(req.body);
      res.json({ success: true, data });
    } catch (err) { next(err); }
  },
};
