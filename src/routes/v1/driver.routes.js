import express from 'express';
import { validate } from '../../middlewares/validation.middleware.js';
import { pagination } from '../../middlewares/pagination.middleware.js';
import {
  createDriverComposite,
  getAllDrivers,
  getDriversPaginated,
  getDriverById,
  updateDriver,
  deleteDriver,
  deactivateDriver,
} from '../../controllers/driver.controller.js';
import {
  createDriverCompositeSchema,
  updateDriverSchema,
} from '../../validations/driver.validation.js';
import { requireAuth } from '../../middlewares/auth.middleware.js';
import { requireRole } from '../../middlewares/role.middleware.js';

const router = express.Router();

// CREATE DRIVER (User + DriverProfile)
router.post(
  '/',
  requireAuth(),
  requireRole('admin'),
  validate(createDriverCompositeSchema),
  createDriverComposite
);

router.get('/', requireAuth(), requireRole('admin'), getAllDrivers);
router.get(
  '/paginated',
  requireAuth(),
  requireRole('admin'),
  pagination({ defaultLimit: 10, maxLimit: 100 }),
  getDriversPaginated
);
router.get('/:id', requireAuth(), requireRole('admin'), getDriverById);
router.put('/:id', requireAuth(), requireRole('admin'), validate(updateDriverSchema), updateDriver);
router.delete('/:id', requireAuth(), requireRole('admin'), deleteDriver);
router.put('/:id/deactivate', requireAuth(), requireRole('admin'), deactivateDriver);

export default router;
