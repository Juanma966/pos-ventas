import { Router } from 'express';
import { userController } from './user.controller.js';
import { authenticate, authorize } from '../../middleware/auth.middleware.js';
import { validate } from '../../middleware/validate.middleware.js';
import { createUserSchema, updateUserSchema, setActiveSchema } from './user.schema.js';

const router = Router();

// Toda la gestión de usuarios es exclusiva de admin.
router.use(authenticate, authorize('admin'));

router.get('/', userController.getAll);
router.get('/roles', userController.getRoles);
router.post('/', validate(createUserSchema), userController.create);
router.put('/:id', validate(updateUserSchema), userController.update);
router.patch('/:id/active', validate(setActiveSchema), userController.setActive);

export default router;
