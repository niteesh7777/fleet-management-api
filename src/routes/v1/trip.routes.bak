import express from 'express';
import { validate } from '../../middlewares/validation.middleware.js';
import { pagination } from '../../middlewares/pagination.middleware.js';
import {
  createTrip,
  getAllTrips,
  getTripsPaginated,
  getTripById,
  updateTrip,
  deleteTrip,
  addProgressUpdate,
  completeTrip,
  getMyTrips,
} from '../../controllers/trip.controller.js';
import {
  createTripSchema,
  updateTripSchema,
  progressUpdateSchema,
} from '../../validations/trip.validation.js';
import { requireRole } from '../../middlewares/role.middleware.js';
import { requireAuth } from '../../middlewares/auth.middleware.js';

const router = express.Router();

// Apply authentication to all routes
router.use(requireAuth());

router.post('/', requireRole('admin'), validate(createTripSchema), createTrip);

router.get('/', requireRole('admin'), getAllTrips);
router.get(
  '/paginated',
  requireRole('admin'),
  pagination({ defaultLimit: 10, maxLimit: 100 }),
  getTripsPaginated
);

router.get('/:id', getTripById); // Drivers might need to see trip details

router.put('/:id', requireRole('admin'), validate(updateTripSchema), updateTrip);

router.delete('/:id', requireRole('admin'), deleteTrip);

router.post(
  '/:id/progress',
  requireRole('driver', 'admin'),
  validate(progressUpdateSchema),
  addProgressUpdate
);

router.post('/:id/complete', requireRole('driver', 'admin'), completeTrip);

router.get('/my', requireRole('driver'), getMyTrips);

export default router;
