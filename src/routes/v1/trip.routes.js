// src/routes/trip.routes.js
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
} from '../../controllers/trip.controller.js';
import {
  createTripSchema,
  updateTripSchema,
  progressUpdateSchema,
} from '../../validations/trip.validation.js';

const router = express.Router();

// Create a new trip
router.post('/', validate(createTripSchema), createTrip);

// Get all trips
router.get('/', getAllTrips);

// Get trip by ID
router.get('/:id', getTripById);

// Update trip details
router.put('/:id', validate(updateTripSchema), updateTrip);

// Delete a trip
router.delete('/:id', deleteTrip);

// Add progress update (e.g., location/status/note)
router.post('/:id/progress', validate(progressUpdateSchema), addProgressUpdate);

// Mark trip as completed
router.post('/:id/complete', completeTrip);

export default router;
