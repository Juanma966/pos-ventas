import { Router } from 'express';
import { branchController } from './branch.controller.js';
import { authenticate, authorize } from '../../middleware/auth.middleware.js';

const router = Router();

// Gestión de sucursales: exclusiva de admin.
router.use(authenticate, authorize('admin'));

router.get('/', branchController.getAll);
router.post('/', branchController.create);
router.put('/:id', branchController.update);
router.delete('/:id', branchController.remove);

export default router;
