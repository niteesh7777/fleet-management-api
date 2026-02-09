import express from 'express';
import { requireAuth } from '../../middlewares/auth.middleware.js';

import platformRouter from './platform/index.js';

import authRouter from './auth.routes.js';
import profileRoutes from './profile.routes.js';
import driverRoutes from './driver.routes.js';
import vehicleRoutes from './vehicle.routes.js';
import tripRoutes from './trip.routes.js';
import routeRoutes from './route.routes.js';
import clientRoutes from './client.routes.js';
import maintenanceRoutes from './maintenance.routes.js';
import analyticsRoutes from './analytics.routes.js';
import adminRoutes from './admin.routes.js';
import userRoutes from './user.routes.js';
import roleRoutes from './role.routes.js';
import auditRoutes from './audit.routes.js';

const router = express.Router();

router.use('/platform', platformRouter);

router.use('/auth', authRouter);

router.use('/admin', requireAuth(), adminRoutes);

router.use('/users', requireAuth(), userRoutes);

router.use('/roles', requireAuth(), roleRoutes);

router.use('/audit', requireAuth(), auditRoutes);

router.use('/profile', requireAuth(), profileRoutes);

router.use('/drivers', requireAuth(), driverRoutes);

router.use('/vehicles', requireAuth(), vehicleRoutes);

router.use('/trips', requireAuth(), tripRoutes);

router.use('/routes', requireAuth(), routeRoutes);

router.use('/clients', requireAuth(), clientRoutes);

router.use('/maintenance', requireAuth(), maintenanceRoutes);

router.use('/analytics', requireAuth(), analyticsRoutes);

export default router;
