import express from 'express';
import { requireAuth } from '../../../middlewares/auth.middleware.js';
import { requirePlatformRole } from '../../../middlewares/role.middleware.js';
import { validate } from '../../../middlewares/validation.middleware.js';
import { platformSignup } from '../../../controllers/auth.controller.js';
import { platformSignupSchema } from '../../../validations/auth.validation.js';

const router = express.Router();

/**
 * Platform Authentication Routes
 *
 * These endpoints handle platform-level operations:
 * - Company onboarding (public)
 * - Platform admin operations (requires platform_admin role)
 *
 * IMPORTANT: These are platform-wide operations, not company-specific
 */

/**
 * Platform signup endpoint for SaaS company onboarding
 * POST /platform/auth/signup
 *
 * Creates:
 * - New Company document
 * - Company Owner user
 * - JWT tokens with tenant context
 *
 * No authentication required (public endpoint)
 * Anyone can create a new company
 */
router.post('/signup', validate(platformSignupSchema), platformSignup);

/**
 * TODO: Platform admin only routes
 * These endpoints will require platformRole = 'platform_admin'
 *
 * Examples:
 * - GET /platform/auth/stats - Platform-wide statistics
 * - GET /platform/auth/users - All platform users
 * - POST /platform/auth/admin - Create platform admin
 * - PATCH /platform/auth/users/:userId - Update user platform role
 */

export default router;
