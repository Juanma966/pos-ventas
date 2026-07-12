import { Router } from 'express';
import { userController } from './user.controller.js';
import { authenticate, authorize } from '../../middleware/auth.middleware.js';

const router = Router();

// Toda la gestión de usuarios es exclusiva de admin.
router.use(authenticate, authorize('admin'));

router.get('/', userController.getAll);
router.get('/roles', userController.getRoles);
router.post('/', userController.create);
router.put('/:id', userController.update);
router.patch('/:id/active', userController.setActive);

export default router;
