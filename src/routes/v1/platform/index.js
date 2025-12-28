import express from 'express';
import platformAuthRouter from './auth.routes.js';
import platformCompaniesRouter from './companies.routes.js';

const router = express.Router();

/**
 * Platform-Level Routes
 *
 * Routes under /platform/* handle system-wide operations:
 * - Public operations (signup, health checks)
 * - Platform admin operations (user/company management, analytics)
 *
 * Key Differences from Company Routes:
 * ┌─────────────────────────────────────────────────────────┐
 * │            Platform Routes    │    Company Routes        │
 * ├──────────────────────────────────────────────────────────┤
 * │ Path: /platform/*             │ Path: /api/v1/*          │
 * │ No auth (signup)              │ Requires auth            │
 * │ Admin only (manage)           │ Company owner/staff      │
 * │ Cross-company operations      │ Single company data      │
 * │ Aggregate data                │ Company-specific data    │
 * └─────────────────────────────────────────────────────────┘
 *
 * SECURITY BOUNDARY:
 * ✅ Platform routes NEVER expose company data to non-admins
 * ✅ Platform admins have read-only access to all companies
 * ✅ Company owners cannot use platform routes
 * ✅ Platform routes require explicit platformRole check
 */

/**
 * Platform Auth Routes
 * POST /platform/auth/signup - Company onboarding (public)
 * TODO: POST /platform/auth/admin - Create platform admin
 * TODO: GET /platform/auth/stats - Platform statistics
 */
router.use('/auth', platformAuthRouter);

/**
 * Platform Company Management Routes
 * TODO: GET /platform/companies - List all companies (admin only)
 * TODO: GET /platform/companies/:companyId - View company (admin only)
 * TODO: PATCH /platform/companies/:companyId - Update company (admin only)
 */
router.use('/companies', platformCompaniesRouter);

export default router;
