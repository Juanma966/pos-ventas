import { cashService } from './cash.service.js';

export const cashController = {
  async getCurrent(req, res, next) {
    try {
      const data = await cashService.getCurrent();
      res.json({ success: true, data });
    } catch (err) { next(err); }
  },

  async getSessions(req, res, next) {
    try {
      const { page, limit } = req.query;
      const data = await cashService.getSessions({ page, limit });
      res.json({ success: true, data });
    } catch (err) { next(err); }
  },

  async open(req, res, next) {
    try {
      const data = await cashService.open(req.body, req.user.sub);
      res.status(201).json({ success: true, data });
    } catch (err) { next(err); }
  },

  async addMovement(req, res, next) {
    try {
      const data = await cashService.addMovement(req.body, req.user.sub);
      res.status(201).json({ success: true, data });
    } catch (err) { next(err); }
  },

  async close(req, res, next) {
    try {
      const data = await cashService.close(req.body, req.user.sub);
      res.json({ success: true, data });
    } catch (err) { next(err); }
  },
};
