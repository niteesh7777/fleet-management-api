import jwt from 'jsonwebtoken';
import AuthService from '../services/auth.service.js';
import { success } from '../utils/response.utils.js';
import AppError from '../utils/appError.js';
import { config } from '../config/env.js';

const service = new AuthService();
const REFRESH_COOKIE_NAME = 'refreshToken';
const ACCESS_COOKIE_NAME = 'accessToken';

const refreshCookieOptions = {
  httpOnly: true,
  secure: config.nodeEnv === 'production',
  sameSite: 'lax',
  maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
};

const accessCookieOptions = {
  httpOnly: true,
  secure: config.nodeEnv === 'production',
  sameSite: 'lax',
  maxAge: 15 * 60 * 1000, // 15 minutes
};

/**
 * Platform signup endpoint for SaaS company onboarding
 * Creates new company and company owner user in one atomic operation
 *
 * POST /platform/signup
 * Body: {
 *   companyName: string,
 *   slug: string,
 *   ownerName: string,
 *   ownerEmail: string,
 *   password: string
 * }
 */
export const platformSignup = async (req, res, next) => {
  try {
    const { user, company, accessToken, refreshToken } = await service.platformSignup(req.body);

    // Set tokens in httpOnly cookies
    res.cookie(ACCESS_COOKIE_NAME, accessToken, accessCookieOptions);
    res.cookie(REFRESH_COOKIE_NAME, refreshToken, refreshCookieOptions);

    return success(
      res,
      'Company and owner created successfully',
      {
        user,
        company,
        // Tokens also returned for mobile clients that can't use cookies
        accessToken,
        refreshToken,
      },
      201
    );
  } catch (err) {
    return next(err);
  }
};

export const register = async (req, res, next) => {
  try {
    const user = await service.register(req.body);
    return success(res, 'User registered successfully', { user }, 201);
  } catch (err) {
    return next(err);
  }
};

export const login = async (req, res, next) => {
  try {
    const { user, accessToken, refreshToken } = await service.login(req.body);

    // Set tokens in httpOnly cookies (secure against XSS)
    res.cookie(ACCESS_COOKIE_NAME, accessToken, accessCookieOptions);
    res.cookie(REFRESH_COOKIE_NAME, refreshToken, refreshCookieOptions);

    // Also return tokens in body for mobile apps that can't use cookies
    return success(res, 'Login successful', { user, accessToken, refreshToken });
  } catch (err) {
    return next(err);
  }
};

export const refresh = async (req, res, next) => {
  try {
    // Support both cookie-based (web) and body-based (mobile) refresh tokens
    const token = req.cookies[REFRESH_COOKIE_NAME] || req.body.refreshToken;
    if (!token) throw new AppError('No refresh token provided', 401);

    const { accessToken, refreshToken } = await service.refresh(token);

    // Set new tokens in httpOnly cookies
    res.cookie(ACCESS_COOKIE_NAME, accessToken, accessCookieOptions);
    res.cookie(REFRESH_COOKIE_NAME, refreshToken, refreshCookieOptions);

    // Return both tokens for mobile apps
    return success(res, 'Token refreshed', { accessToken, refreshToken });
  } catch (err) {
    return next(err);
  }
};

export const logout = async (req, res, next) => {
  try {
    const token = req.cookies[REFRESH_COOKIE_NAME];

    // Clear both cookies immediately
    const clearOptions = {
      httpOnly: true,
      sameSite: 'lax',
      secure: config.nodeEnv === 'production',
    };
    res.clearCookie(ACCESS_COOKIE_NAME, clearOptions);
    res.clearCookie(REFRESH_COOKIE_NAME, clearOptions);

    // Get user info from authenticated request (set by requireAuth middleware)
    const userId = req.user?.id;
    const companyId = req.user?.companyId;

    if (!userId || !companyId) {
      return success(res, 'Logged out', {}, 200);
    }

    // Clear refresh token from database
    await service.logout(userId, companyId);

    return success(res, 'Logged out successfully');
  } catch (err) {
    return next(err);
  }
};
