import { Router } from 'express';
import { employeeController } from './employee.controller.js';
import { authenticate } from '../../middleware/auth.middleware.js';

const router = Router();

router.use(authenticate);

router.get('/', employeeController.getAll);
router.get('/:id', employeeController.getById);
router.post('/', employeeController.create);
router.put('/:id', employeeController.update);
router.delete('/:id', employeeController.remove);

router.post('/:id/movements', employeeController.addMovement);
router.delete('/:id/movements/:movementId', employeeController.removeMovement);

export default router;
