import { Router } from 'express';
import { fixedExpenseController } from './fixedExpense.controller.js';
import { authenticate } from '../../middleware/auth.middleware.js';
import { validate } from '../../middleware/validate.middleware.js';
import { createFixedExpenseSchema, updateFixedExpenseSchema } from './fixedExpense.schema.js';

const router = Router();

router.use(authenticate);

router.get('/', fixedExpenseController.getAll);
router.get('/summary', fixedExpenseController.getSummary);
router.post('/', validate(createFixedExpenseSchema), fixedExpenseController.create);
router.put('/:id', validate(updateFixedExpenseSchema), fixedExpenseController.update);
router.delete('/:id', fixedExpenseController.remove);

export default router;
