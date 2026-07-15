import { Router } from 'express';
import { saleController } from './sale.controller.js';
import { authenticate, authorize } from '../../middleware/auth.middleware.js';
import { validate } from '../../middleware/validate.middleware.js';
import { CASH_ROLES } from '../../config/roles.js';
import { createSaleSchema, createReturnSchema } from './sale.schema.js';

const router = Router();

router.use(authenticate);

router.get('/', saleController.getAll);
router.get('/:id', saleController.getById);
router.post('/', validate(createSaleSchema), saleController.create);
// Anular y devolver: solo admin y cajero (el vendedor no revierte ventas).
router.post('/:id/cancel', authorize(...CASH_ROLES), saleController.cancel);
router.post('/:id/return', authorize(...CASH_ROLES), validate(createReturnSchema), saleController.createReturn);

export default router;
