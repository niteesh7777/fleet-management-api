import AppError from '../utils/appError.js';

export const requireRole = (...roles) => {
  return (req, res, next) => {
    try {
      if (!req.user) return next(new AppError('Not authenticated', 401));

      const userRoles = [req.user.platformRole, req.user.companyRole].filter(Boolean);

      if (!userRoles.some((role) => roles.includes(role))) {
        return next(new AppError('Forbidden: insufficient permissions', 403));
      }
      next();
    } catch (err) {
      next(err);
    }
  };
};

export const requirePlatformRole = (...roles) => {
  return (req, res, next) => {
    try {
      if (!req.user) return next(new AppError('Not authenticated', 401));

      if (!roles.includes(req.user.platformRole)) {
        return next(new AppError('Forbidden: platform admin required', 403));
      }
      next();
    } catch (err) {
      next(err);
    }
  };
};

export const requireCompanyRole = (...roles) => {
  return (req, res, next) => {
    try {
      if (!req.user) return next(new AppError('Not authenticated', 401));

      if (!roles.includes(req.user.companyRole)) {
        return next(new AppError('Forbidden: insufficient company permissions', 403));
      }
      next();
    } catch (err) {
      next(err);
    }
  };
};
