import { Router } from 'express';
import { inventoryController } from './inventory.controller.js';
import { authenticate } from '../../middleware/auth.middleware.js';

const router = Router();

router.use(authenticate);

router.get('/', inventoryController.getAll);
router.post('/adjustments', inventoryController.createAdjustment);

export default router;
