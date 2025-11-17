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

      // Option 1: attach payload only (fast)
      req.user = { id: payload.id, role: payload.role };

      // Option 2 (optional): fetch fresh user record if you need DB data
      // const user = await repo.findById(payload.id);
      // if (!user) return next(new AppError('User not found', 404));
      // req.user = { id: user._id, role: user.role, name: user.name, email: user.email };

      next();
    } catch (err) {
      next(err);
    }
  };
};
