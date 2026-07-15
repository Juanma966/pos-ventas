import { Router } from 'express';
import { productController } from './product.controller.js';
import { authenticate, authorize } from '../../middleware/auth.middleware.js';
import { validate } from '../../middleware/validate.middleware.js';
import { ADMIN_ONLY } from '../../config/roles.js';
import { createProductSchema, updateProductSchema } from './product.schema.js';

const router = Router();

router.use(authenticate);

router.get('/', productController.getAll);
router.get('/:id', productController.getById);
router.post('/', authorize(...ADMIN_ONLY), validate(createProductSchema), productController.create);
router.put('/:id', authorize(...ADMIN_ONLY), validate(updateProductSchema), productController.update);
router.delete('/:id', authorize(...ADMIN_ONLY), productController.remove);

export default router;
