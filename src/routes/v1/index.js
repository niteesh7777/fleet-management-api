import express from 'express';
import authRouter from './auth.routes.js';
import profileRoutes from './profile.routes.js';
import driverRoutes from './driver.routes.js';
import vehicleRoutes from './vehicle.routes.js';
import tripRoutes from './trip.routes.js';
import routeRoutes from './route.routes.js';
import clientRoutes from './client.routes.js'

const router = express.Router();

router.get('/', (req, res) => {
  res.json({ message: 'v1 router is working' });
});

router.use('/auth', authRouter);
router.use('/profile', profileRoutes);
router.use('/drivers', driverRoutes);
router.use('/vehicles', vehicleRoutes);
router.use('/trips', tripRoutes);
router.use('/routes', routeRoutes);
router.use('/clients', clientRoutes);

export default router;
