import { Router } from 'express';
import { purchaseController } from './purchase.controller.js';
import { authenticate } from '../../middleware/auth.middleware.js';
import { validate } from '../../middleware/validate.middleware.js';
import { purchaseSchema } from './purchase.schema.js';

const router = Router();

router.use(authenticate);

router.get('/', purchaseController.getAll);
router.get('/:id', purchaseController.getById);
router.post('/', validate(purchaseSchema), purchaseController.create);
router.put('/:id', validate(purchaseSchema), purchaseController.update);
router.post('/:id/receive', purchaseController.receive);
router.post('/:id/cancel', purchaseController.cancel);
router.delete('/:id', purchaseController.remove);

export default router;
