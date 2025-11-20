import express from 'express';
import { requireAuth } from '../../middlewares/auth.middleware.js';
import { requireRole } from '../../middlewares/role.middleware.js';
import { validate } from '../../middlewares/validation.middleware.js';
import { createDriverComposite } from '../../controllers/admin.controller.js';
import { createDriverCompositeSchema } from '../../validations/admin.validation.js';

const router = express.Router();

router.post(
  '/drivers',
  requireAuth(),
  requireRole('admin'),
  validate(createDriverCompositeSchema),
  createDriverComposite
);

export default router;
