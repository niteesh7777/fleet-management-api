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

const router = express.Router();

// Apply authentication to all routes
router.use(requireAuth());

router.post('/', requireRole('admin'), validate(createRouteSchema), createRoute);
router.get('/', requireRole('admin'), getAllRoutes);
router.get(
  '/paginated',
  requireRole('admin'),
  pagination({ defaultLimit: 10, maxLimit: 100 }),
  getRoutesPaginated
);
router.get('/:id', getRouteById); // Drivers might need to see route details
router.put('/:id', requireRole('admin'), validate(updateRouteSchema), updateRoute);
router.delete('/:id', requireRole('admin'), deleteRoute);

export default router;
