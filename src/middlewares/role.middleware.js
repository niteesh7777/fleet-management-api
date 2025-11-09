import AppError from '../utils/appError.js';

export const requireRole = (...allowedRoles) => {
  return (req, res, next) => {
    try {
      if (!req.user) return next(new AppError('Not authenticated', 401));
      if (!allowedRoles.includes(req.user.role)) {
        return next(new AppError('Forbidden: insufficient permissions', 403));
      }
      return next();
    } catch (err) {
      return next(err);
    }
  };
};
