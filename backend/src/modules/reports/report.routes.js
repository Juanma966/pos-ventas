import { Router } from 'express';
import { reportController } from './report.controller.js';
import { authenticate } from '../../middleware/auth.middleware.js';

const router = Router();

router.use(authenticate);

router.get('/sales', reportController.sales);
router.get('/dashboard', reportController.dashboard);

export default router;
