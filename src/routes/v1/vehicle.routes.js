// src/routes/vehicle.routes.js
import express from 'express';
import { validate } from '../../middlewares/validation.middleware.js';
import {
  createVehicle,
  getAllVehicles,
  getVehicleById,
  updateVehicle,
  deleteVehicle,
  updateVehicleStatus,
  checkInsurance,
} from '../../controllers/vehicle.controller.js';
import {
  createVehicleSchema,
  updateVehicleSchema,
  updateVehicleStatusSchema,
} from '../../validations/vehicle.validation.js';

const router = express.Router();

// Create vehicle
router.post('/', validate(createVehicleSchema), createVehicle);

// Get all vehicles
router.get('/', getAllVehicles);

// Get single vehicle
router.get('/:id', getVehicleById);

// Update vehicle
router.put('/:id', validate(updateVehicleSchema), updateVehicle);

// Delete vehicle
router.delete('/:id', deleteVehicle);

// Update vehicle status
router.patch('/:id/status', validate(updateVehicleStatusSchema), updateVehicleStatus);

// Check insurance validity
router.get('/:id/insurance', checkInsurance);

export default router;
