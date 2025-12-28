import jwt from 'jsonwebtoken';
import AppError from '../utils/appError.js';
import { config } from '../config/env.js';
// import UserRepository from '../repositories/user.repository.js';

// const repo = new UserRepository();

export const requireAuth = () => {
  return async (req, res, next) => {
    try {
      const authHeader = req.headers.authorization || '';
      const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null;

      if (!token) return next(new AppError('Authorization token missing', 401));

      let payload;
      try {
        payload = jwt.verify(token, config.accessTokenSecret);
      } catch (err) {
        console.log('err:', err);
        return next(new AppError('Invalid or expired access token', 401));
      }

      // CRITICAL: Validate tenant context exists in JWT
      if (!payload.companyId) {
        return next(new AppError('Invalid token: missing tenant context (companyId)', 401));
      }

      req.user = {
        id: payload.id,
        userId: payload.id, // Alias for consistency
        email: payload.email,
        companyId: payload.companyId,
        platformRole: payload.platformRole,
        companyRole: payload.companyRole,
      };

      next();
    } catch (err) {
      next(err);
    }
  };
};
