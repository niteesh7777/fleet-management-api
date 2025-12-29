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
  updateDriverLocation,
  getMyProfile,
  getDriverDependencies,
  bulkDeleteDrivers,
} from '../../controllers/driver.controller.js';
import {
  createDriverCompositeSchema,
  updateDriverSchema,
  updateLocationSchema,
} from '../../validations/driver.validation.js';
import { requireAuth } from '../../middlewares/auth.middleware.js';
import { requireRole } from '../../middlewares/role.middleware.js';
import { COMPANY_ADMIN_ROLES, COMPANY_DRIVER_ROLES } from '../../constants/roleGroups.js';

const router = express.Router();

// DRIVER MOBILE APP ENDPOINTS (authenticated driver only)
router.get('/me', requireAuth(), requireRole(...COMPANY_DRIVER_ROLES), getMyProfile);
router.put(
  '/:id/location',
  requireAuth(),
  requireRole(...COMPANY_DRIVER_ROLES),
  validate(updateLocationSchema),
  updateDriverLocation
);

// ADMIN ENDPOINTS
router.post(
  '/',
  requireAuth(),
  requireRole(...COMPANY_ADMIN_ROLES),
  validate(createDriverCompositeSchema),
  createDriverComposite
);

router.get('/', requireAuth(), requireRole(...COMPANY_ADMIN_ROLES), getAllDrivers);
router.get(
  '/paginated',
  requireAuth(),
  requireRole(...COMPANY_ADMIN_ROLES),
  pagination({ defaultLimit: 10, maxLimit: 100 }),
  getDriversPaginated
);
router.get('/:id', requireAuth(), requireRole(...COMPANY_ADMIN_ROLES), getDriverById);
router.put(
  '/:id',
  requireAuth(),
  requireRole(...COMPANY_ADMIN_ROLES),
  validate(updateDriverSchema),
  updateDriver
);
router.delete('/:id', requireAuth(), requireRole(...COMPANY_ADMIN_ROLES), deleteDriver);
router.post('/bulk-delete', requireAuth(), requireRole(...COMPANY_ADMIN_ROLES), bulkDeleteDrivers);
router.get(
  '/:id/dependencies',
  requireAuth(),
  requireRole(...COMPANY_ADMIN_ROLES),
  getDriverDependencies
);
router.put('/:id/deactivate', requireAuth(), requireRole(...COMPANY_ADMIN_ROLES), deactivateDriver);

export default router;
