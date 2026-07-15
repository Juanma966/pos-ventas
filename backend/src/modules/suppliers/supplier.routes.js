import { Router } from 'express';
import { supplierController } from './supplier.controller.js';
import { authenticate, authorize } from '../../middleware/auth.middleware.js';
import { validate } from '../../middleware/validate.middleware.js';
import { ADMIN_ONLY } from '../../config/roles.js';
import { createSupplierSchema, updateSupplierSchema } from './supplier.schema.js';

const router = Router();

router.use(authenticate, authorize(...ADMIN_ONLY));

router.get('/', supplierController.getAll);
router.get('/:id', supplierController.getById);
router.post('/', validate(createSupplierSchema), supplierController.create);
router.put('/:id', validate(updateSupplierSchema), supplierController.update);
router.delete('/:id', supplierController.remove);

export default router;
