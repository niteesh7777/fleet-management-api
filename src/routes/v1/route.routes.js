import express from 'express';
import { validate } from '../../middlewares/validation.middleware.js';
import {
  createRoute,
  getAllRoutes,
  getRouteById,
  updateRoute,
  deleteRoute,
} from '../../controllers/route.controller.js';
import { createRouteSchema, updateRouteSchema } from '../../validations/route.validation.js';

const router = express.Router();

router.post('/', validate(createRouteSchema), createRoute);
router.get('/', getAllRoutes);
router.get('/:id', getRouteById);
router.put('/:id', validate(updateRouteSchema), updateRoute);
router.delete('/:id', deleteRoute);

export default router;
