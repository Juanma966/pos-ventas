import { Router } from 'express';
import { employeeController } from './employee.controller.js';
import { authenticate, authorize } from '../../middleware/auth.middleware.js';
import { validate } from '../../middleware/validate.middleware.js';
import { ADMIN_ONLY } from '../../config/roles.js';
import { createEmployeeSchema, updateEmployeeSchema, employeeMovementSchema } from './employee.schema.js';

const router = Router();

router.use(authenticate, authorize(...ADMIN_ONLY));

router.get('/', employeeController.getAll);
router.get('/:id', employeeController.getById);
router.post('/', validate(createEmployeeSchema), employeeController.create);
router.put('/:id', validate(updateEmployeeSchema), employeeController.update);
router.delete('/:id', employeeController.remove);

router.post('/:id/movements', validate(employeeMovementSchema), employeeController.addMovement);
router.delete('/:id/movements/:movementId', employeeController.removeMovement);

export default router;
