import { productService } from './product.service.js';

export const productController = {
  async getAll(req, res, next) {
    try {
      const { search, categoryId, active, page, limit } = req.query;
      const data = await productService.findAll({ search, categoryId, active, page, limit });
      res.json({ success: true, data });
    } catch (err) { next(err); }
  },

  async getById(req, res, next) {
    try {
      const data = await productService.findById(Number(req.params.id));
      res.json({ success: true, data });
    } catch (err) { next(err); }
  },

  async create(req, res, next) {
    try {
      const data = await productService.create(req.body);
      res.status(201).json({ success: true, data });
    } catch (err) { next(err); }
  },

  async update(req, res, next) {
    try {
      const data = await productService.update(Number(req.params.id), req.body);
      res.json({ success: true, data });
    } catch (err) { next(err); }
  },

  async remove(req, res, next) {
    try {
      await productService.remove(Number(req.params.id));
      res.json({ success: true, message: 'Producto eliminado' });
    } catch (err) { next(err); }
  },
};
