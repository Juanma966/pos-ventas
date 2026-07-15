import { Router } from 'express';
import { brandController } from './brand.controller.js';
import { authenticate, authorize } from '../../middleware/auth.middleware.js';
import { validate } from '../../middleware/validate.middleware.js';
import { ADMIN_ONLY } from '../../config/roles.js';
import { createBrandSchema, updateBrandSchema } from './brand.schema.js';

const router = Router();

router.use(authenticate);

router.get('/', brandController.getAll);
router.get('/:id', brandController.getById);
router.post('/', authorize(...ADMIN_ONLY), validate(createBrandSchema), brandController.create);
router.put('/:id', authorize(...ADMIN_ONLY), validate(updateBrandSchema), brandController.update);
router.delete('/:id', authorize(...ADMIN_ONLY), brandController.remove);

export default router;
