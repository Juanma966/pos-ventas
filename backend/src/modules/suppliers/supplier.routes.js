import { Router } from 'express';
import { supplierController } from './supplier.controller.js';
import { authenticate } from '../../middleware/auth.middleware.js';
import { validate } from '../../middleware/validate.middleware.js';
import { createSupplierSchema, updateSupplierSchema } from './supplier.schema.js';

const router = Router();

router.use(authenticate);

router.get('/', supplierController.getAll);
router.get('/:id', supplierController.getById);
router.post('/', validate(createSupplierSchema), supplierController.create);
router.put('/:id', validate(updateSupplierSchema), supplierController.update);
router.delete('/:id', supplierController.remove);

export default router;
