import { Router } from 'express';
import { inventoryController } from './inventory.controller.js';
import { authenticate } from '../../middleware/auth.middleware.js';
import { validate } from '../../middleware/validate.middleware.js';
import { adjustmentSchema } from './inventory.schema.js';

const router = Router();

router.use(authenticate);

router.get('/', inventoryController.getAll);
router.post('/adjustments', validate(adjustmentSchema), inventoryController.createAdjustment);

export default router;
