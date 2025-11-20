import express from 'express';
import authRouter from './auth.routes.js';
import profileRoutes from './profile.routes.js';
import driverRoutes from './driver.routes.js';
import vehicleRoutes from './vehicle.routes.js';
import tripRoutes from './trip.routes.js';
import routeRoutes from './route.routes.js';
import clientRoutes from './client.routes.js';
import maintenanceRoutes from './maintenance.routes.js';
import analyticsRoutes from './analytics.routes.js'
import adminRoutes from './admin.routes.js';


const router = express.Router();

router.use('/auth', authRouter); //tested
router.use('/admin', adminRoutes);
router.use('/profile', profileRoutes);
router.use('/drivers', driverRoutes);
router.use('/vehicles', vehicleRoutes);
router.use('/trips', tripRoutes);
router.use('/routes', routeRoutes);
router.use('/clients', clientRoutes);
router.use('/maintenance', maintenanceRoutes);
router.use('/analytics', analyticsRoutes);

export default router;
