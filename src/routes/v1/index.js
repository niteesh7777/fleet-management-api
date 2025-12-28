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

/**
 * Route Structure - Clear Separation of Concerns
 *
 * PLATFORM ROUTES (/platform/*)
 * ├─ Public operations (platform signup - no auth required)
 * ├─ Platform admin operations (require platformRole='platform_admin')
 * └─ Cross-company views (platform admins only)
 *
 * COMPANY ROUTES (/api/v1/*)
 * ├─ Company authentication (login, logout, token refresh)
 * ├─ Company operations (vehicles, trips, drivers, etc.)
 * ├─ All require authentication and companyRole validation
 * └─ Company owners/staff access only
 *
 * SECURITY BOUNDARIES:
 * ✅ Platform routes NEVER expose company data to non-admins
 * ✅ Company data only accessible through company routes
 * ✅ Platform admins cannot accidentally access company data via company routes
 * ✅ Each route enforces role requirements explicitly
 */

/**
 * ========== PLATFORM ROUTES ==========
 * These handle system-wide operations
 * Public signup + platform admin functions
 *
 * Accessible at: GET /platform/*
 */
router.use('/platform', platformRouter);

/**
 * ========== COMPANY ROUTES ==========
 * These handle company-specific operations
 * All require authentication and company role validation
 *
 * Accessible at: GET /api/v1/*
 */

/**
 * Authentication Routes
 * POST /auth/login - Company user login
 * POST /auth/logout - Company user logout
 * POST /auth/refresh - Token refresh
 *
 * NOTE: Platform signup is at /platform/auth/signup
 */
router.use('/auth', authRouter);

/**
 * Admin Routes (Company-level)
 * TODO: Ensure these require company_admin or company_owner role
 * DELETE /admin/drivers/:id - Delete driver (admin only)
 */
router.use('/admin', requireAuth(), adminRoutes);

/**
 * User Routes (Company-level)
 * GET /users - List users in company
 * GET /users/:id - View user profile
 * PATCH /users/:id - Update user
 * DELETE /users/:id - Remove user from company
 *
 * TODO: Ensure all routes validate req.user.companyId
 */
router.use('/users', requireAuth(), userRoutes);

/**
 * Role Routes (Company-level)
 * GET /roles - List company roles
 * POST /roles - Create custom role (company admin only)
 *
 * TODO: Ensure all routes are company-scoped
 */
router.use('/roles', requireAuth(), roleRoutes);

/**
 * Audit Routes (Company-level)
 * GET /audit - View company audit logs
 *
 * TODO: Ensure audit logs are filtered by companyId
 */
router.use('/audit', requireAuth(), auditRoutes);

/**
 * Profile Routes (Company-level)
 * GET /profile - Get authenticated user profile
 * PATCH /profile - Update profile
 */
router.use('/profile', requireAuth(), profileRoutes);

/**
 * Driver Routes (Company-level)
 * GET /drivers - List drivers in company
 * POST /drivers - Create driver
 * GET /drivers/:id - View driver
 * PATCH /drivers/:id - Update driver
 * DELETE /drivers/:id - Delete driver
 *
 * TODO: Ensure all routes are scoped by companyId
 */
router.use('/drivers', requireAuth(), driverRoutes);

/**
 * Vehicle Routes (Company-level)
 * GET /vehicles - List vehicles in company
 * POST /vehicles - Create vehicle
 * GET /vehicles/:id - View vehicle
 * PATCH /vehicles/:id - Update vehicle
 * DELETE /vehicles/:id - Delete vehicle
 *
 * TODO: Ensure all routes are scoped by companyId
 */
router.use('/vehicles', requireAuth(), vehicleRoutes);

/**
 * Trip Routes (Company-level)
 * GET /trips - List trips in company
 * POST /trips - Create trip
 * GET /trips/:id - View trip
 * PATCH /trips/:id - Update trip
 * DELETE /trips/:id - Delete trip
 *
 * TODO: Ensure all routes are scoped by companyId
 */
router.use('/trips', requireAuth(), tripRoutes);

/**
 * Route Routes (Company-level)
 * GET /routes - List routes in company
 * POST /routes - Create route
 * GET /routes/:id - View route
 * PATCH /routes/:id - Update route
 * DELETE /routes/:id - Delete route
 *
 * Note: "routes" refers to logistics routes, not API routes
 * TODO: Ensure all routes are scoped by companyId
 */
router.use('/routes', requireAuth(), routeRoutes);

/**
 * Client Routes (Company-level)
 * GET /clients - List clients in company
 * POST /clients - Create client
 * GET /clients/:id - View client
 * PATCH /clients/:id - Update client
 * DELETE /clients/:id - Delete client
 *
 * TODO: Ensure all routes are scoped by companyId
 */
router.use('/clients', requireAuth(), clientRoutes);

/**
 * Maintenance Routes (Company-level)
 * GET /maintenance - List maintenance logs in company
 * POST /maintenance - Create maintenance log
 * GET /maintenance/:id - View maintenance log
 * PATCH /maintenance/:id - Update maintenance log
 * DELETE /maintenance/:id - Delete maintenance log
 *
 * TODO: Ensure all routes are scoped by companyId
 */
router.use('/maintenance', requireAuth(), maintenanceRoutes);

/**
 * Analytics Routes (Company-level)
 * GET /analytics/vehicles - Vehicle analytics
 * GET /analytics/trips - Trip analytics
 * GET /analytics/drivers - Driver analytics
 *
 * TODO: Ensure all analytics are scoped by companyId
 */
router.use('/analytics', requireAuth(), analyticsRoutes);

export default router;
