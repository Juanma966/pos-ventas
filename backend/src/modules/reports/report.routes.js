import { Router } from 'express';
import { reportController } from './report.controller.js';
import { authenticate, authorize } from '../../middleware/auth.middleware.js';
import { ADMIN_ONLY } from '../../config/roles.js';

const router = Router();

router.use(authenticate);

// El dashboard lo ven todos los roles; los reportes detallados son solo admin.
router.get('/dashboard', reportController.dashboard);
router.get('/sales', authorize(...ADMIN_ONLY), reportController.sales);
router.get('/purchases', authorize(...ADMIN_ONLY), reportController.purchases);
router.get('/cash', authorize(...ADMIN_ONLY), reportController.cash);
router.get('/inventory', authorize(...ADMIN_ONLY), reportController.inventory);

export default router;
