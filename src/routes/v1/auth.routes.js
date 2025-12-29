import express from 'express';
import { validate } from '../../middlewares/validation.middleware.js';
import { requireAuth } from '../../middlewares/auth.middleware.js';
import { requireCompanyRole } from '../../middlewares/role.middleware.js';
import { register, login, refresh, logout } from '../../controllers/auth.controller.js';
import { registerSchema, loginSchema } from '../../validations/auth.validation.js';

const router = express.Router();

/**
 * Company Authentication Routes
 *
 * These endpoints handle company-level authentication:
 * - Login (company user)
 * - Logout (company user)
 * - Token refresh (company user)
 * - User registration within company (company admin only - to be implemented)
 *
 * NOTE: Platform signup is NOT here
 * Platform signup is at: POST /platform/auth/signup (public, no auth required)
 * Company signup flows through platform signup first
 */

/**
 * Company user registration
 * TODO: Requires company_admin role to invite new users to company
 * This is different from platform signup which creates the company
 */
router.post('/register', validate(registerSchema), register);

/**
 * Company user login
 * POST /auth/login
 * Public endpoint, no auth required
 */
router.post('/login', validate(loginSchema), login);

/**
 * Refresh access token using refresh cookie or body
 * POST /auth/refresh
 * Public endpoint, uses refresh token from cookie or body
 */
router.post('/refresh', refresh);

/**
 * Logout user (clear refresh cookie, invalidate session)
 * POST /auth/logout
 * Requires authentication to logout
 * Clears refresh token JTI from database
 */
router.post('/logout', requireAuth(), logout);

export default router;
