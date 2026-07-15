import { Router } from 'express';
import { categoryController } from './category.controller.js';
import { authenticate, authorize } from '../../middleware/auth.middleware.js';
import { validate } from '../../middleware/validate.middleware.js';
import { ADMIN_ONLY } from '../../config/roles.js';
import { createCategorySchema, updateCategorySchema } from './category.schema.js';

const router = Router();

router.use(authenticate);

router.get('/', categoryController.getAll);
router.get('/:id', categoryController.getById);
router.post('/', authorize(...ADMIN_ONLY), validate(createCategorySchema), categoryController.create);
router.put('/:id', authorize(...ADMIN_ONLY), validate(updateCategorySchema), categoryController.update);
router.delete('/:id', authorize(...ADMIN_ONLY), categoryController.remove);

export default router;
