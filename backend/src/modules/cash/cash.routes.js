import { Router } from 'express';
import { cashController } from './cash.controller.js';
import { authenticate } from '../../middleware/auth.middleware.js';

const router = Router();

router.use(authenticate);

router.get('/current', cashController.getCurrent);
router.get('/sessions', cashController.getSessions);
router.post('/open', cashController.open);
router.post('/movements', cashController.addMovement);
router.post('/close', cashController.close);

export default router;
