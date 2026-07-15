import { Router } from 'express';
import { purchaseController } from './purchase.controller.js';
import { authenticate, authorize } from '../../middleware/auth.middleware.js';
import { validate } from '../../middleware/validate.middleware.js';
import { ADMIN_ONLY } from '../../config/roles.js';
import { purchaseSchema } from './purchase.schema.js';

const router = Router();

router.use(authenticate, authorize(...ADMIN_ONLY));

router.get('/', purchaseController.getAll);
router.get('/:id', purchaseController.getById);
router.post('/', validate(purchaseSchema), purchaseController.create);
router.put('/:id', validate(purchaseSchema), purchaseController.update);
router.post('/:id/receive', purchaseController.receive);
router.post('/:id/cancel', purchaseController.cancel);
router.delete('/:id', purchaseController.remove);

export default router;
