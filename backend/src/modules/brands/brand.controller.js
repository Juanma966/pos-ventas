import { brandService } from './brand.service.js';

export const brandController = {
  async getAll(req, res, next) {
    try {
      const data = await brandService.findAll();
      res.json({ success: true, data });
    } catch (err) { next(err); }
  },

  async getById(req, res, next) {
    try {
      const data = await brandService.findById(Number(req.params.id));
      res.json({ success: true, data });
    } catch (err) { next(err); }
  },

  async create(req, res, next) {
    try {
      const data = await brandService.create(req.body);
      res.status(201).json({ success: true, data });
    } catch (err) { next(err); }
  },

  async update(req, res, next) {
    try {
      const data = await brandService.update(Number(req.params.id), req.body);
      res.json({ success: true, data });
    } catch (err) { next(err); }
  },

  async remove(req, res, next) {
    try {
      await brandService.remove(Number(req.params.id));
      res.json({ success: true, message: 'Marca eliminada' });
    } catch (err) { next(err); }
  },
};
