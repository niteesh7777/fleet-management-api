import express from 'express';
import { validate } from '../../middlewares/validation.middleware.js';
import { pagination } from '../../middlewares/pagination.middleware.js';
import {
  createTrip,
  getTripsPaginated,
  getTripById,
  updateTrip,
  deleteTrip,
  addProgressUpdate,
  completeTrip,
  getMyTrips,
  getAvailableResources,
  getTripDependencies,
  bulkDeleteTrips,
} from '../../controllers/trip.controller.js';
import {
  createTripSchema,
  updateTripSchema,
  progressUpdateSchema,
} from '../../validations/trip.validation.js';
import { requireRole } from '../../middlewares/role.middleware.js';
import { requireAuth } from '../../middlewares/auth.middleware.js';
import { COMPANY_ADMIN_ROLES, COMPANY_DRIVER_ROLES } from '../../constants/roleGroups.js';

const router = express.Router();

// Apply authentication to all routes
router.use(requireAuth());

// DRIVER ENDPOINTS - Must come before /:id routes
router.get('/my', requireRole(...COMPANY_DRIVER_ROLES), getMyTrips);

// Get available resources for trip creation (admin only)
router.get('/available-resources', requireRole(...COMPANY_ADMIN_ROLES), getAvailableResources);

// ADMIN ENDPOINTS
router.post('/', validate(createTripSchema), createTrip); // Allow authenticated users to create trips

// Get all trips with pagination (supports filters: status, clientId, routeId, startDate, endDate, search)
router.get(
  '/',
  requireRole(...COMPANY_ADMIN_ROLES),
  pagination({ defaultLimit: 10, maxLimit: 100 }),
  getTripsPaginated
);

router.get('/:id', getTripById); // Drivers might need to see trip details

router.put('/:id', requireRole(...COMPANY_ADMIN_ROLES), validate(updateTripSchema), updateTrip);

router.delete('/:id', requireRole(...COMPANY_ADMIN_ROLES), deleteTrip);

router.post('/bulk-delete', requireRole(...COMPANY_ADMIN_ROLES), bulkDeleteTrips);

router.get('/:id/dependencies', requireRole(...COMPANY_ADMIN_ROLES), getTripDependencies);

router.post(
  '/:id/progress',
  requireRole(...COMPANY_DRIVER_ROLES, ...COMPANY_ADMIN_ROLES),
  validate(progressUpdateSchema),
  addProgressUpdate
);

router.post(
  '/:id/complete',
  requireRole(...COMPANY_DRIVER_ROLES, ...COMPANY_ADMIN_ROLES),
  completeTrip
);

export default router;
