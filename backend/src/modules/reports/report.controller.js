import { reportService } from './report.service.js';

export const reportController = {
  async sales(req, res, next) {
    try {
      const { from, to } = req.query;
      const data = await reportService.salesReport({ from, to });
      res.json({ success: true, data });
    } catch (err) { next(err); }
  },

  async dashboard(req, res, next) {
    try {
      const data = await reportService.dashboard();
      res.json({ success: true, data });
    } catch (err) { next(err); }
  },
};
