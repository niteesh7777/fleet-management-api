import AppError from '../utils/appError.js';

export const requireTenantAccess = () => {
  return (req, res, next) => {
    try {

      if (!req.user) {
        return next(new AppError('Not authenticated', 401));
      }

      if (!req.user.companyId) {
        return next(new AppError('Invalid request: missing tenant context', 400));
      }

      req.companyId = req.user.companyId;

      next();
    } catch (err) {
      next(err);
    }
  };
};

export const validateResourceOwnership = (resource, userCompanyId, resourceType = 'Resource') => {
  if (!resource) {
    throw new AppError(`${resourceType} not found`, 404);
  }

  if (!resource.companyId) {
    throw new AppError('Invalid resource: missing company context', 500);
  }

  if (resource.companyId.toString() !== userCompanyId.toString()) {
    throw new AppError(`Forbidden: ${resourceType} does not belong to your company`, 403);
  }
};

export const validateBulkResourceOwnership = (
  resources,
  userCompanyId,
  resourceType = 'Resource'
) => {
  if (!Array.isArray(resources)) {
    throw new AppError('Invalid resources: expected array', 500);
  }

  for (const resource of resources) {
    validateResourceOwnership(resource, userCompanyId, resourceType);
  }
};

export default requireTenantAccess;
