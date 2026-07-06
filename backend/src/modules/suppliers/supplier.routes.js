import { Router } from 'express';
import { supplierController } from './supplier.controller.js';
import { authenticate } from '../../middleware/auth.middleware.js';

const router = Router();

router.use(authenticate);

router.get('/', supplierController.getAll);
router.get('/:id', supplierController.getById);
router.post('/', supplierController.create);
router.put('/:id', supplierController.update);
router.delete('/:id', supplierController.remove);

export default router;
