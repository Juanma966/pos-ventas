import { fixedExpenseService } from './fixedExpense.service.js';

export const fixedExpenseController = {
  async getAll(req, res, next) {
    try {
      const { category, active } = req.query;
      const data = await fixedExpenseService.findAll({ category, active });
      res.json({ success: true, data });
    } catch (err) { next(err); }
  },

  async getSummary(req, res, next) {
    try {
      const data = await fixedExpenseService.summary();
      res.json({ success: true, data });
    } catch (err) { next(err); }
  },

  async create(req, res, next) {
    try {
      const data = await fixedExpenseService.create(req.body);
      res.status(201).json({ success: true, data });
    } catch (err) { next(err); }
  },

  async update(req, res, next) {
    try {
      const data = await fixedExpenseService.update(Number(req.params.id), req.body);
      res.json({ success: true, data });
    } catch (err) { next(err); }
  },

  async remove(req, res, next) {
    try {
      await fixedExpenseService.remove(Number(req.params.id));
      res.json({ success: true, message: 'Gasto fijo eliminado' });
    } catch (err) { next(err); }
  },
};
