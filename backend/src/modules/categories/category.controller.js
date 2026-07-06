import { categoryService } from './category.service.js';

export const categoryController = {
  async getAll(req, res, next) {
    try {
      const data = await categoryService.findAll();
      res.json({ success: true, data });
    } catch (err) { next(err); }
  },

  async getById(req, res, next) {
    try {
      const data = await categoryService.findById(Number(req.params.id));
      res.json({ success: true, data });
    } catch (err) { next(err); }
  },

  async create(req, res, next) {
    try {
      const data = await categoryService.create(req.body);
      res.status(201).json({ success: true, data });
    } catch (err) { next(err); }
  },

  async update(req, res, next) {
    try {
      const data = await categoryService.update(Number(req.params.id), req.body);
      res.json({ success: true, data });
    } catch (err) { next(err); }
  },

  async remove(req, res, next) {
    try {
      await categoryService.remove(Number(req.params.id));
      res.json({ success: true, message: 'Categoría eliminada' });
    } catch (err) { next(err); }
  },
};
