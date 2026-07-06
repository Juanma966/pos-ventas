import { Router } from 'express';
import { brandController } from './brand.controller.js';
import { authenticate } from '../../middleware/auth.middleware.js';

const router = Router();

router.use(authenticate);

router.get('/', brandController.getAll);
router.get('/:id', brandController.getById);
router.post('/', brandController.create);
router.put('/:id', brandController.update);
router.delete('/:id', brandController.remove);

export default router;
