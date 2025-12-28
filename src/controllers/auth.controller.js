import jwt from 'jsonwebtoken';
import AuthService from '../services/auth.service.js';
import { success } from '../utils/response.utils.js';
import AppError from '../utils/appError.js';
import { config } from '../config/env.js';

const service = new AuthService();
const COOKIE_NAME = 'refreshToken';

const cookieOptions = {
  httpOnly: true,
  secure: config.nodeEnv === 'production',
  sameSite: 'lax',
  maxAge: 7 * 24 * 60 * 60 * 1000,
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

    // Set refresh token cookie (for web clients)
    res.cookie(COOKIE_NAME, refreshToken, cookieOptions);

    return success(
      res,
      'Company and owner created successfully',
      {
        user,
        company,
        accessToken,
        refreshToken, // Also return in body for mobile clients
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
    console.log('[AUTH] Login request body:', JSON.stringify(req.body, null, 2));
    const { user, accessToken, refreshToken } = await service.login(req.body);

    res.cookie(COOKIE_NAME, refreshToken, cookieOptions);

    // Also return refreshToken in body for mobile apps that can't use cookies
    return success(res, 'Login successful', { user, accessToken, refreshToken });
  } catch (err) {
    console.log('[AUTH] Login error:', err.message);
    return next(err);
  }
};

export const refresh = async (req, res, next) => {
  try {
    // Support both cookie-based (web) and body-based (mobile) refresh tokens
    const token = req.cookies[COOKIE_NAME] || req.body.refreshToken;
    if (!token) throw new AppError('No refresh token provided', 401);

    const { accessToken, refreshToken } = await service.refresh(token);

    // Rotate refresh token
    res.cookie(COOKIE_NAME, refreshToken, cookieOptions);

    // Return both tokens for mobile apps
    return success(res, 'Token refreshed', { accessToken, refreshToken });
  } catch (err) {
    return next(err);
  }
};

export const logout = async (req, res, next) => {
  try {
    const token = req.cookies[COOKIE_NAME];

    // Clear cookie immediately
    res.clearCookie(COOKIE_NAME, {
      httpOnly: true,
      sameSite: 'lax',
      secure: config.nodeEnv === 'production',
    });

    if (!token) return success(res, 'Logged out', {}, 200);

    // Verify refresh token to find user ID
    let payload = null;
    try {
      payload = jwt.verify(token, config.refreshTokenSecret);
    } catch (e) {
      payload = null;
    }

    if (payload?.id) {
      await service.logout(payload.id);
    }

    return success(res, 'Logged out successfully');
  } catch (err) {
    return next(err);
  }
};
