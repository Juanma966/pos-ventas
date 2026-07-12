import { Router } from 'express';
import { auditController } from './audit.controller.js';
import { authenticate, authorize } from '../../middleware/auth.middleware.js';

const router = Router();

// La auditoría es exclusiva de admin.
router.use(authenticate, authorize('admin'));

router.get('/', auditController.getAll);

export default router;
