import { purchaseService } from './purchase.service.js';

export const purchaseController = {
  async getAll(req, res, next) {
    try {
      const { search, status, supplierId, page, limit } = req.query;
      const data = await purchaseService.findAll({ search, status, supplierId, page, limit });
      res.json({ success: true, data });
    } catch (err) { next(err); }
  },

  async getById(req, res, next) {
    try {
      const data = await purchaseService.findById(Number(req.params.id));
      res.json({ success: true, data });
    } catch (err) { next(err); }
  },

  async create(req, res, next) {
    try {
      const data = await purchaseService.create(req.body, req.user.sub);
      res.status(201).json({ success: true, data });
    } catch (err) { next(err); }
  },

  async update(req, res, next) {
    try {
      const data = await purchaseService.update(Number(req.params.id), req.body);
      res.json({ success: true, data });
    } catch (err) { next(err); }
  },

  async receive(req, res, next) {
    try {
      const data = await purchaseService.receive(Number(req.params.id), req.user.sub);
      res.json({ success: true, data });
    } catch (err) { next(err); }
  },

  async cancel(req, res, next) {
    try {
      const data = await purchaseService.cancel(Number(req.params.id));
      res.json({ success: true, data });
    } catch (err) { next(err); }
  },

  async remove(req, res, next) {
    try {
      await purchaseService.remove(Number(req.params.id));
      res.json({ success: true, message: 'Compra eliminada' });
    } catch (err) { next(err); }
  },
};
