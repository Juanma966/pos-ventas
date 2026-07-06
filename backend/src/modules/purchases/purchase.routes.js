import { Router } from 'express';
import { purchaseController } from './purchase.controller.js';
import { authenticate } from '../../middleware/auth.middleware.js';

const router = Router();

router.use(authenticate);

router.get('/', purchaseController.getAll);
router.get('/:id', purchaseController.getById);
router.post('/', purchaseController.create);
router.put('/:id', purchaseController.update);
router.post('/:id/receive', purchaseController.receive);
router.post('/:id/cancel', purchaseController.cancel);
router.delete('/:id', purchaseController.remove);

export default router;
