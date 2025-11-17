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

router.post('/', validate(createVehicleSchema), createVehicle);

router.get('/', getAllVehicles);

router.get('/:id', getVehicleById);

router.put('/:id', validate(updateVehicleSchema), updateVehicle);

router.delete('/:id', deleteVehicle);

router.patch('/:id/status', validate(updateVehicleStatusSchema), updateVehicleStatus);

router.get('/:id/insurance', checkInsurance);

export default router;
