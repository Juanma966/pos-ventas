import { Router } from 'express';
import { cashController } from './cash.controller.js';
import { authenticate, authorize } from '../../middleware/auth.middleware.js';
import { validate } from '../../middleware/validate.middleware.js';
import { CASH_ROLES } from '../../config/roles.js';
import { openCashSchema, cashMovementSchema, closeCashSchema } from './cash.schema.js';

const router = Router();

router.use(authenticate, authorize(...CASH_ROLES));

router.get('/current', cashController.getCurrent);
router.get('/sessions', cashController.getSessions);
router.post('/open', validate(openCashSchema), cashController.open);
router.post('/movements', validate(cashMovementSchema), cashController.addMovement);
router.post('/close', validate(closeCashSchema), cashController.close);

export default router;
