import express from 'express';
import { validate } from '../../middlewares/validation.middleware.js';
import { pagination } from '../../middlewares/pagination.middleware.js';
import {
  createRoute,
  getAllRoutes,
  getRoutesPaginated,
  getRouteById,
  updateRoute,
  deleteRoute,
} from '../../controllers/route.controller.js';
import { createRouteSchema, updateRouteSchema } from '../../validations/route.validation.js';
import { requireRole } from '../../middlewares/role.middleware.js';
import { requireAuth } from '../../middlewares/auth.middleware.js';
import { COMPANY_ADMIN_ROLES } from '../../constants/roleGroups.js';

const router = express.Router();

// Apply authentication to all routes
router.use(requireAuth());

router.post('/', validate(createRouteSchema), createRoute); // Allow authenticated users to create routes for trip planning
router.get('/', requireRole(...COMPANY_ADMIN_ROLES), getAllRoutes);
router.get(
  '/paginated',
  requireRole(...COMPANY_ADMIN_ROLES),
  pagination({ defaultLimit: 10, maxLimit: 100 }),
  getRoutesPaginated
);
router.get('/:id', getRouteById); // Drivers might need to see route details
router.put('/:id', requireRole(...COMPANY_ADMIN_ROLES), validate(updateRouteSchema), updateRoute);
router.delete('/:id', requireRole(...COMPANY_ADMIN_ROLES), deleteRoute);

export default router;
