import { Router } from 'express';
import { settingsController } from './settings.controller.js';
import { authenticate, authorize } from '../../middleware/auth.middleware.js';
import { validate } from '../../middleware/validate.middleware.js';
import { updateCompanySchema } from './settings.schema.js';

const router = Router();

router.use(authenticate);

// Cualquier usuario autenticado puede leer los datos de la empresa (los usa el ticket).
router.get('/company', settingsController.getCompany);
// Solo admin puede modificarlos.
router.put('/company', authorize('admin'), validate(updateCompanySchema), settingsController.updateCompany);

export default router;
