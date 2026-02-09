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
  sameSite: config.nodeEnv === 'production' ? 'none' : 'lax',
  maxAge: 7 * 24 * 60 * 60 * 1000,
};

const accessCookieOptions = {
  httpOnly: true,
  secure: config.nodeEnv === 'production',
  sameSite: config.nodeEnv === 'production' ? 'none' : 'lax',
  maxAge: 15 * 60 * 1000,
};

export const platformSignup = async (req, res, next) => {
  try {
    const { user, company, accessToken, refreshToken } = await service.platformSignup(req.body);

    res.cookie(ACCESS_COOKIE_NAME, accessToken, accessCookieOptions);
    res.cookie(REFRESH_COOKIE_NAME, refreshToken, refreshCookieOptions);

    return success(
      res,
      'Company and owner created successfully',
      {
        user,
        company,

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

    res.cookie(ACCESS_COOKIE_NAME, accessToken, accessCookieOptions);
    res.cookie(REFRESH_COOKIE_NAME, refreshToken, refreshCookieOptions);

    return success(res, 'Login successful', { user, accessToken, refreshToken });
  } catch (err) {
    return next(err);
  }
};

export const refresh = async (req, res, next) => {
  try {
    const token =
      (req.cookies && req.cookies[REFRESH_COOKIE_NAME]) || (req.body && req.body.refreshToken);
    if (!token) throw new AppError('No refresh token provided', 401);

    const { accessToken, refreshToken } = await service.refresh(token);

    res.cookie(ACCESS_COOKIE_NAME, accessToken, accessCookieOptions);
    res.cookie(REFRESH_COOKIE_NAME, refreshToken, refreshCookieOptions);

    return success(res, 'Token refreshed', { accessToken, refreshToken });
  } catch (err) {
    return next(err);
  }
};

export const logout = async (req, res, next) => {
  try {
    const clearOptions = {
      httpOnly: true,
      sameSite: config.nodeEnv === 'production' ? 'none' : 'lax',
      secure: config.nodeEnv === 'production',
    };
    res.clearCookie(ACCESS_COOKIE_NAME, clearOptions);
    res.clearCookie(REFRESH_COOKIE_NAME, clearOptions);

    const userId = req.user?.id;
    const companyId = req.user?.companyId;

    if (!userId || !companyId) {
      return success(res, 'Logged out', {}, 200);
    }

    await service.logout(userId, companyId);

    return success(res, 'Logged out successfully');
  } catch (err) {
    return next(err);
  }
};
