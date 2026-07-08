import { saleService } from './sale.service.js';

export const saleController = {
  async getAll(req, res, next) {
    try {
      const { search, status, paymentMethod, page, limit } = req.query;
      const data = await saleService.findAll({ search, status, paymentMethod, page, limit });
      res.json({ success: true, data });
    } catch (err) { next(err); }
  },

  async getById(req, res, next) {
    try {
      const data = await saleService.findById(Number(req.params.id));
      res.json({ success: true, data });
    } catch (err) { next(err); }
  },

  async create(req, res, next) {
    try {
      const data = await saleService.create(req.body, req.user.sub);
      res.status(201).json({ success: true, data });
    } catch (err) { next(err); }
  },

  async cancel(req, res, next) {
    try {
      const data = await saleService.cancel(Number(req.params.id), req.user.sub);
      res.json({ success: true, data });
    } catch (err) { next(err); }
  },

  async createReturn(req, res, next) {
    try {
      const data = await saleService.createReturn(Number(req.params.id), req.body, req.user.sub);
      res.status(201).json({ success: true, data });
    } catch (err) { next(err); }
  },
};
