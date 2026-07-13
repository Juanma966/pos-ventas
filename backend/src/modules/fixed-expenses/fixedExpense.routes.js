import { Router } from 'express';
import { fixedExpenseController } from './fixedExpense.controller.js';
import { authenticate } from '../../middleware/auth.middleware.js';

const router = Router();

router.use(authenticate);

router.get('/', fixedExpenseController.getAll);
router.get('/summary', fixedExpenseController.getSummary);
router.post('/', fixedExpenseController.create);
router.put('/:id', fixedExpenseController.update);
router.delete('/:id', fixedExpenseController.remove);

export default router;
