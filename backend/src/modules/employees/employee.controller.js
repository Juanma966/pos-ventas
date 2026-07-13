import { employeeService } from './employee.service.js';

export const employeeController = {
  async getAll(req, res, next) {
    try {
      const { search, active } = req.query;
      const data = await employeeService.findAll({ search, active });
      res.json({ success: true, data });
    } catch (err) { next(err); }
  },

  async getById(req, res, next) {
    try {
      const data = await employeeService.findById(Number(req.params.id));
      res.json({ success: true, data });
    } catch (err) { next(err); }
  },

  async create(req, res, next) {
    try {
      const data = await employeeService.create(req.body);
      res.status(201).json({ success: true, data });
    } catch (err) { next(err); }
  },

  async update(req, res, next) {
    try {
      const data = await employeeService.update(Number(req.params.id), req.body);
      res.json({ success: true, data });
    } catch (err) { next(err); }
  },

  async remove(req, res, next) {
    try {
      await employeeService.remove(Number(req.params.id));
      res.json({ success: true, message: 'Empleado eliminado' });
    } catch (err) { next(err); }
  },

  async addMovement(req, res, next) {
    try {
      const data = await employeeService.addMovement(Number(req.params.id), req.body);
      res.status(201).json({ success: true, data });
    } catch (err) { next(err); }
  },

  async removeMovement(req, res, next) {
    try {
      const data = await employeeService.removeMovement(Number(req.params.id), Number(req.params.movementId));
      res.json({ success: true, data });
    } catch (err) { next(err); }
  },
};
