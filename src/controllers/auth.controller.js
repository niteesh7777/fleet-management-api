import jwt from 'jsonwebtoken';
import AuthService from '../services/auth.service.js';
import { success } from '../utils/response.utils.js';
import AppError from '../utils/appError.js';
import { config } from '../config/env.js';

const service = new AuthService();
const COOKIE_NAME = 'refreshToken';

// ✅ Shared cookie config
const cookieOptions = {
  httpOnly: true,
  secure: config.nodeEnv === 'production',
  sameSite: 'lax',
  maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
};

// =========================================
// REGISTER
// =========================================
export const register = async (req, res, next) => {
  try {
    const user = await service.register(req.body);
    return success(res, 'User registered successfully', { user }, 201);
  } catch (err) {
    return next(err);
  }
};

// =========================================
// LOGIN
// =========================================
export const login = async (req, res, next) => {
  try {
    const { user, accessToken, refreshToken } = await service.login(req.body);

    res.cookie(COOKIE_NAME, refreshToken, cookieOptions);

    return success(res, 'Login successful', { user, accessToken });
  } catch (err) {
    return next(err);
  }
};

// =========================================
// REFRESH TOKEN
// =========================================
export const refresh = async (req, res, next) => {
  try {
    const token = req.cookies[COOKIE_NAME];
    if (!token) throw new AppError('No refresh token provided', 401);

    const { accessToken, refreshToken } = await service.refresh(token);

    // Rotate refresh token
    res.cookie(COOKIE_NAME, refreshToken, cookieOptions);

    return success(res, 'Token refreshed', { accessToken });
  } catch (err) {
    return next(err);
  }
};

// =========================================
// LOGOUT
// =========================================
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
