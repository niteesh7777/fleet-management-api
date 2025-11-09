import AuthService from '../services/auth.service.js';
import { success } from '../utils/response.utils.js';
import AppError from '../utils/appError.js';
import { config } from '../config/env.js';

const service = new AuthService();
const COOKIE_NAME = 'refreshToken';

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

    res.cookie(COOKIE_NAME, refreshToken, {
      httpOnly: true,
      secure: config.nodeEnv === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    return success(res, 'Login successful', { user, accessToken });
  } catch (err) {
    return next(err);
  }
};

export const refresh = async (req, res, next) => {
  try {
    const token = req.cookies[COOKIE_NAME];
    if (!token) throw new AppError('No refresh token provided', 401);

    const { accessToken, refreshToken } = await service.refresh(token);

    res.cookie(COOKIE_NAME, refreshToken, {
      httpOnly: true,
      secure: config.nodeEnv === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    return success(res, 'Token refreshed', { accessToken });
  } catch (err) {
    return next(err);
  }
};

import jwt from 'jsonwebtoken';
export const logout = async (req, res, next) => {
  try {
    const token = req.cookies[COOKIE_NAME];
    res.clearCookie(COOKIE_NAME, {
      httpOnly: true,
      sameSite: 'lax',
      secure: config.nodeEnv === 'production',
    });
    if (!token) return success(res, 'Logged out', {}, 200);

    let payload = null;
    try {
      payload = jwt.verify(token, config.refreshTokenSecrete);
    } catch (e) {
      payload = null;
    }
    if (payload?.id) await service.logout(payload.id);

    return success(res, 'Logged out successfully');
  } catch (err) {
    return next(err);
  }
};
