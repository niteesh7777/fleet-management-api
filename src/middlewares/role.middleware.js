import AppError from '../utils/appError.js';

export const requireRole = (...roles) => {
  return (req, res, next) => {
    try {
      if (!req.user) return next(new AppError('Not authenticated', 401));
      if (!roles.includes(req.user.role)) {
        return next(new AppError('Forbidden: insufficient permissions', 403));
      }
      next();
    } catch (err) {
      next(err);
    }
  };
};
