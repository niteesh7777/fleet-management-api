import express from 'express';
import { validate } from '../../middlewares/validation.middleware.js';
import {
  createTrip,
  getAllTrips,
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

router.post('/', validate(createTripSchema), createTrip);

router.get('/', getAllTrips);

router.get('/:id', getTripById);

router.put('/:id', validate(updateTripSchema), updateTrip);

router.delete('/:id', deleteTrip);

router.post('/:id/progress', validate(progressUpdateSchema), addProgressUpdate);

router.post('/:id/complete', completeTrip);

router.get('/my', requireAuth, requireRole('driver'), getMyTrips);

export default router;
