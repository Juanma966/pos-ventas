import { inventoryService } from './inventory.service.js';

export const inventoryController = {
  async getAll(req, res, next) {
    try {
      const { productId, type, page, limit } = req.query;
      const data = await inventoryService.findAll({ productId, type, page, limit });
      res.json({ success: true, data });
    } catch (err) { next(err); }
  },

  async createAdjustment(req, res, next) {
    try {
      const data = await inventoryService.createAdjustment(req.body, req.user.sub);
      res.status(201).json({ success: true, data });
    } catch (err) { next(err); }
  },
};
