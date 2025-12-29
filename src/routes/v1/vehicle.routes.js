// src/routes/vehicle.routes.js
import express from 'express';
import { validate } from '../../middlewares/validation.middleware.js';
import {
  createVehicle,
  getAllVehicles,
  getVehiclesPaginated,
  getVehicleById,
  updateVehicle,
  deleteVehicle,
  updateVehicleStatus,
  checkInsurance,
  assignDriver,
  getVehicleDependencies,
  bulkDeleteVehicles,
} from '../../controllers/vehicle.controller.js';
import {
  createVehicleSchema,
  updateVehicleSchema,
  updateVehicleStatusSchema,
} from '../../validations/vehicle.validation.js';

import { requireRole } from '../../middlewares/role.middleware.js';
import { requireAuth } from '../../middlewares/auth.middleware.js';
import { COMPANY_ADMIN_ROLES, COMPANY_DRIVER_ROLES } from '../../constants/roleGroups.js';
import { pagination } from '../../middlewares/pagination.middleware.js';

const router = express.Router();

// Apply authentication to all routes
router.use(requireAuth());

router.post('/', requireRole(...COMPANY_ADMIN_ROLES), validate(createVehicleSchema), createVehicle);

router.get('/', requireRole(...COMPANY_ADMIN_ROLES), getAllVehicles);

router.get(
  '/paginated',
  requireRole(...COMPANY_ADMIN_ROLES),
  pagination({ defaultLimit: 10, maxLimit: 100 }),
  getVehiclesPaginated
);

router.get('/:id', getVehicleById); // Drivers might need to see vehicle details

router.put(
  '/:id',
  requireRole(...COMPANY_ADMIN_ROLES),
  validate(updateVehicleSchema),
  updateVehicle
);

router.delete('/:id', requireRole(...COMPANY_ADMIN_ROLES), deleteVehicle);

router.post('/bulk-delete', requireRole(...COMPANY_ADMIN_ROLES), bulkDeleteVehicles);

router.get('/:id/dependencies', requireRole(...COMPANY_ADMIN_ROLES), getVehicleDependencies);

router.patch(
  '/:id/status',
  requireRole(...COMPANY_DRIVER_ROLES, ...COMPANY_ADMIN_ROLES),
  validate(updateVehicleStatusSchema),
  updateVehicleStatus
);

router.get('/:id/insurance', checkInsurance);

router.post(
  '/:vehicleId/assign-driver/:driverId',
  requireRole(...COMPANY_ADMIN_ROLES),
  assignDriver
);

export default router;
