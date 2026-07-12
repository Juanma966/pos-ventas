import { Router } from 'express';
import { reportController } from './report.controller.js';
import { authenticate } from '../../middleware/auth.middleware.js';

const router = Router();

router.use(authenticate);

router.get('/sales', reportController.sales);
router.get('/purchases', reportController.purchases);
router.get('/cash', reportController.cash);
router.get('/dashboard', reportController.dashboard);

export default router;
