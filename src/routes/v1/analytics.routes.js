import express from 'express';
import {
  getDashboardStats,
  getTripSummary,
  getVehicleSummary,
  getDriverSummary,
  getFinancialSummary,
  getTopClients,
} from '../../controllers/analytics.controller.js';
import { requireRole } from '../../middlewares/role.middleware.js';
import { COMPANY_ADMIN_ROLES } from '../../constants/roleGroups.js';

const router = express.Router();

router.get('/dashboard', requireRole(...COMPANY_ADMIN_ROLES), getDashboardStats);
router.get('/trips', requireRole(...COMPANY_ADMIN_ROLES), getTripSummary);
router.get('/vehicles', requireRole(...COMPANY_ADMIN_ROLES), getVehicleSummary);
router.get('/drivers', requireRole(...COMPANY_ADMIN_ROLES), getDriverSummary);
router.get('/financials', requireRole(...COMPANY_ADMIN_ROLES), getFinancialSummary);
router.get('/top-clients', requireRole(...COMPANY_ADMIN_ROLES), getTopClients);

export default router;
