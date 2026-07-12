import { userService } from './user.service.js';

export const userController = {
  async getAll(req, res, next) {
    try {
      const data = await userService.findAll({ search: req.query.search });
      res.json({ success: true, data });
    } catch (err) { next(err); }
  },

  async getRoles(req, res, next) {
    try {
      const data = await userService.getRoles();
      res.json({ success: true, data });
    } catch (err) { next(err); }
  },

  async create(req, res, next) {
    try {
      const data = await userService.create(req.body);
      res.status(201).json({ success: true, data });
    } catch (err) { next(err); }
  },

  async update(req, res, next) {
    try {
      const data = await userService.update(Number(req.params.id), req.body);
      res.json({ success: true, data });
    } catch (err) { next(err); }
  },

  async setActive(req, res, next) {
    try {
      const data = await userService.setActive(Number(req.params.id), req.body.active, req.user.sub);
      res.json({ success: true, data });
    } catch (err) { next(err); }
  },
};
