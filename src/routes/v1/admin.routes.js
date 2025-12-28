import express from 'express';
import { requireAuth } from '../../middlewares/auth.middleware.js';
import { requireRole } from '../../middlewares/role.middleware.js';
import { validate } from '../../middlewares/validation.middleware.js';
import { createDriverComposite, getAllDrivers } from '../../controllers/admin.controller.js';
import { createDriverCompositeSchema } from '../../validations/admin.validation.js';
import { OWNER_ADMIN_ROLES } from '../../constants/roleGroups.js';

const router = express.Router();

router.post(
  '/drivers',
  requireAuth(),
  requireRole(...OWNER_ADMIN_ROLES),
  validate(createDriverCompositeSchema),
  createDriverComposite
);

router.get('/drivers', requireAuth(), requireRole(...OWNER_ADMIN_ROLES), getAllDrivers);

export default router;
