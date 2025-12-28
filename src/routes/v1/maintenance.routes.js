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
import { COMPANY_ADMIN_ROLES } from '../../constants/roleGroups.js';

const router = express.Router();

// Apply authentication to all routes
router.use(requireAuth());

router.post(
  '/',
  requireRole(...COMPANY_ADMIN_ROLES),
  validate(createMaintenanceSchema),
  createMaintenance
);
router.get('/', requireRole(...COMPANY_ADMIN_ROLES), getAllMaintenance);
router.get(
  '/paginated',
  requireRole(...COMPANY_ADMIN_ROLES),
  pagination({ defaultLimit: 10, maxLimit: 100 }),
  getMaintenancePaginated
);
router.get('/:id', getMaintenanceById);
router.get('/vehicle/:vehicleId', getLogsByVehicle);
router.put(
  '/:id',
  requireRole(...COMPANY_ADMIN_ROLES),
  validate(updateMaintenanceSchema),
  updateMaintenance
);
router.delete('/:id', requireRole(...COMPANY_ADMIN_ROLES), deleteMaintenance);

export default router;
