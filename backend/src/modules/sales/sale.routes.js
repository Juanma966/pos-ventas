import { Router } from 'express';
import { saleController } from './sale.controller.js';
import { authenticate } from '../../middleware/auth.middleware.js';

const router = Router();

router.use(authenticate);

router.get('/', saleController.getAll);
router.get('/:id', saleController.getById);
router.post('/', saleController.create);
router.post('/:id/cancel', saleController.cancel);

export default router;
