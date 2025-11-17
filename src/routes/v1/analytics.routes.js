import express from 'express';
import {
  getDashboardStats,
  getTripSummary,
  getVehicleSummary,
  getDriverSummary,
  getFinancialSummary,
  getTopClients,
} from '../../controllers/analytics.controller.js';

const router = express.Router();

router.get('/dashboard', getDashboardStats);
router.get('/trips', getTripSummary);
router.get('/vehicles', getVehicleSummary);
router.get('/drivers', getDriverSummary);
router.get('/financials', getFinancialSummary);
router.get('/top-clients', getTopClients);

export default router;
