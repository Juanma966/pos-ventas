import { Router } from 'express';
import { saleController } from './sale.controller.js';
import { authenticate } from '../../middleware/auth.middleware.js';
import { validate } from '../../middleware/validate.middleware.js';
import { createSaleSchema, createReturnSchema } from './sale.schema.js';

const router = Router();

router.use(authenticate);

router.get('/', saleController.getAll);
router.get('/:id', saleController.getById);
router.post('/', validate(createSaleSchema), saleController.create);
router.post('/:id/cancel', saleController.cancel);
router.post('/:id/return', validate(createReturnSchema), saleController.createReturn);

export default router;
