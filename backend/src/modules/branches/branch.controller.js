import { branchService } from './branch.service.js';

export const branchController = {
  async getAll(req, res, next) {
    try {
      const data = await branchService.findAll({ search: req.query.search });
      res.json({ success: true, data });
    } catch (err) { next(err); }
  },

  async create(req, res, next) {
    try {
      const data = await branchService.create(req.body);
      res.status(201).json({ success: true, data });
    } catch (err) { next(err); }
  },

  async update(req, res, next) {
    try {
      const data = await branchService.update(Number(req.params.id), req.body);
      res.json({ success: true, data });
    } catch (err) { next(err); }
  },

  async remove(req, res, next) {
    try {
      await branchService.remove(Number(req.params.id));
      res.json({ success: true, message: 'Sucursal eliminada' });
    } catch (err) { next(err); }
  },
};
