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
} from '../../controllers/vehicle.controller.js';
import {
  createVehicleSchema,
  updateVehicleSchema,
  updateVehicleStatusSchema,
} from '../../validations/vehicle.validation.js';

import { requireRole } from '../../middlewares/role.middleware.js';
import { requireAuth } from '../../middlewares/auth.middleware.js';
import { pagination } from '../../middlewares/pagination.middleware.js';

const router = express.Router();

// Apply authentication to all routes
router.use(requireAuth());

router.post('/', requireRole('admin'), validate(createVehicleSchema), createVehicle);

router.get('/', requireRole('admin'), getAllVehicles);

router.get(
  '/paginated',
  requireRole('admin'),
  pagination({ defaultLimit: 10, maxLimit: 100 }),
  getVehiclesPaginated
);

router.get('/:id', getVehicleById); // Drivers might need to see vehicle details

router.put('/:id', requireRole('admin'), validate(updateVehicleSchema), updateVehicle);

router.delete('/:id', requireRole('admin'), deleteVehicle);

router.patch(
  '/:id/status',
  requireRole('driver', 'admin'),
  validate(updateVehicleStatusSchema),
  updateVehicleStatus
);

router.get('/:id/insurance', checkInsurance);

router.post('/:vehicleId/assign-driver/:driverId', requireRole('admin'), assignDriver);

export default router;
