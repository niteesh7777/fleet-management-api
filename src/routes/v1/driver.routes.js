import express from 'express';
import { validate } from '../../middlewares/validation.middleware.js';
import {
  createDriver,
  getAllDrivers,
  getDriverById,
  updateDriver,
  deleteDriver,
} from '../../controllers/driver.controller.js';
import { createDriverSchema, updateDriverSchema } from '../../validations/driver.validation.js';

const router = express.Router();

router.post('/', validate(createDriverSchema), createDriver);
router.get('/', getAllDrivers);
router.get('/:id', getDriverById);
router.put('/:id', validate(updateDriverSchema), updateDriver);
router.delete('/:id', deleteDriver);

export default router;
