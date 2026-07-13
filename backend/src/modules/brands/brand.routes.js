import { Router } from 'express';
import { brandController } from './brand.controller.js';
import { authenticate } from '../../middleware/auth.middleware.js';
import { validate } from '../../middleware/validate.middleware.js';
import { createBrandSchema, updateBrandSchema } from './brand.schema.js';

const router = Router();

router.use(authenticate);

router.get('/', brandController.getAll);
router.get('/:id', brandController.getById);
router.post('/', validate(createBrandSchema), brandController.create);
router.put('/:id', validate(updateBrandSchema), brandController.update);
router.delete('/:id', brandController.remove);

export default router;
