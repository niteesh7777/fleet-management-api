import express from 'express';
import { requireAuth } from '../../../middlewares/auth.middleware.js';
import { requirePlatformRole } from '../../../middlewares/role.middleware.js';

const router = express.Router();

/**
 * Platform Company Management Routes
 *
 * These endpoints are for platform admins to manage companies across the system
 * IMPORTANT: These are read-only views of company data, not for company owners
 *
 * All routes require:
 * 1. Authentication (requireAuth)
 * 2. Platform admin role (requirePlatformRole('platform_admin'))
 */

/**
 * TODO: Implement platform admin company management
 *
 * Routes to add:
 * - GET /platform/companies - List all companies (platform admin only)
 * - GET /platform/companies/:companyId - View company details (platform admin only)
 * - PATCH /platform/companies/:companyId - Update company (platform admin only)
 * - DELETE /platform/companies/:companyId - Delete company (platform admin only)
 * - GET /platform/companies/:companyId/users - View company users (platform admin only)
 * - GET /platform/companies/:companyId/audit - View company audit logs (platform admin only)
 *
 * These should be READ operations by platform admins ONLY
 * Company owners use the company API instead: /api/v1/companies/:companyId
 */

export default router;
