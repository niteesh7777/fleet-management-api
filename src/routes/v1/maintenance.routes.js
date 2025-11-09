// src/routes/maintenance.routes.js
import express from 'express';
import { validate } from '../../middlewares/validation.middleware.js';
import {
  createMaintenance,
  getAllMaintenance,
  getMaintenanceById,
  updateMaintenance,
  deleteMaintenance,
  getLogsByVehicle,
} from '../../controllers/maintenance.controller.js';
import {
  createMaintenanceSchema,
  updateMaintenanceSchema,
} from '../../validations/maintenance.validation.js';

const router = express.Router();

router.post('/', validate(createMaintenanceSchema), createMaintenance);
router.get('/', getAllMaintenance);
router.get('/:id', getMaintenanceById);
router.get('/vehicle/:vehicleId', getLogsByVehicle);
router.put('/:id', validate(updateMaintenanceSchema), updateMaintenance);
router.delete('/:id', deleteMaintenance);

export default router;
