import express from 'express';
import { validate } from '../../middlewares/validation.middleware.js';
import { pagination } from '../../middlewares/pagination.middleware.js';
import {
  createMaintenance,
  getAllMaintenance,
  getMaintenancePaginated,
  getMaintenanceById,
  updateMaintenance,
  deleteMaintenance,
  getLogsByVehicle,
} from '../../controllers/maintenance.controller.js';
import {
  createMaintenanceSchema,
  updateMaintenanceSchema,
} from '../../validations/maintenance.validation.js';
import { requireRole } from '../../middlewares/role.middleware.js';
import { requireAuth } from '../../middlewares/auth.middleware.js';

const router = express.Router();

// Apply authentication to all routes
router.use(requireAuth());

router.post('/', requireRole('admin'), validate(createMaintenanceSchema), createMaintenance);
router.get('/', requireRole('admin'), getAllMaintenance);
router.get(
  '/paginated',
  requireRole('admin'),
  pagination({ defaultLimit: 10, maxLimit: 100 }),
  getMaintenancePaginated
);
router.get('/:id', getMaintenanceById);
router.get('/vehicle/:vehicleId', getLogsByVehicle);
router.put('/:id', requireRole('admin'), validate(updateMaintenanceSchema), updateMaintenance);
router.delete('/:id', requireRole('admin'), deleteMaintenance);

export default router;
