import { auditService } from './audit.service.js';

export const auditController = {
  async getAll(req, res, next) {
    try {
      const { userId, entity, action, from, to, page, limit } = req.query;
      const data = await auditService.findAll({ userId, entity, action, from, to, page, limit });
      res.json({ success: true, data });
    } catch (err) { next(err); }
  },
};
