import { customerService } from './customer.service.js';

export const customerController = {
  async getAll(req, res, next) {
    try {
      const { search, active, page, limit } = req.query;
      const data = await customerService.findAll({ search, active, page, limit });
      res.json({ success: true, data });
    } catch (err) { next(err); }
  },

  async getById(req, res, next) {
    try {
      const data = await customerService.findById(Number(req.params.id));
      res.json({ success: true, data });
    } catch (err) { next(err); }
  },

  async create(req, res, next) {
    try {
      const data = await customerService.create(req.body);
      res.status(201).json({ success: true, data });
    } catch (err) { next(err); }
  },

  async update(req, res, next) {
    try {
      const data = await customerService.update(Number(req.params.id), req.body);
      res.json({ success: true, data });
    } catch (err) { next(err); }
  },

  async remove(req, res, next) {
    try {
      await customerService.remove(Number(req.params.id));
      res.json({ success: true, message: 'Cliente eliminado' });
    } catch (err) { next(err); }
  },
};
