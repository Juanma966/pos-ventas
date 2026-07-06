import { supplierService } from './supplier.service.js';

export const supplierController = {
  async getAll(req, res, next) {
    try {
      const { search, active, page, limit } = req.query;
      const data = await supplierService.findAll({ search, active, page, limit });
      res.json({ success: true, data });
    } catch (err) { next(err); }
  },

  async getById(req, res, next) {
    try {
      const data = await supplierService.findById(Number(req.params.id));
      res.json({ success: true, data });
    } catch (err) { next(err); }
  },

  async create(req, res, next) {
    try {
      const data = await supplierService.create(req.body);
      res.status(201).json({ success: true, data });
    } catch (err) { next(err); }
  },

  async update(req, res, next) {
    try {
      const data = await supplierService.update(Number(req.params.id), req.body);
      res.json({ success: true, data });
    } catch (err) { next(err); }
  },

  async remove(req, res, next) {
    try {
      await supplierService.remove(Number(req.params.id));
      res.json({ success: true, message: 'Proveedor eliminado' });
    } catch (err) { next(err); }
  },
};
