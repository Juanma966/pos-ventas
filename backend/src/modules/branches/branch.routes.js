import { Router } from 'express';
import { branchController } from './branch.controller.js';
import { authenticate, authorize } from '../../middleware/auth.middleware.js';
import { validate } from '../../middleware/validate.middleware.js';
import { createBranchSchema, updateBranchSchema } from './branch.schema.js';

const router = Router();

// Gestión de sucursales: exclusiva de admin.
router.use(authenticate, authorize('admin'));

router.get('/', branchController.getAll);
router.post('/', validate(createBranchSchema), branchController.create);
router.put('/:id', validate(updateBranchSchema), branchController.update);
router.delete('/:id', branchController.remove);

export default router;
