import AppError from '../utils/appError.js';

/**
 * Tenant Isolation Middleware
 * Ensures all protected resources are accessed within the user's company boundary.
 *
 * Usage:
 * - Apply to all protected routes after requireAuth()
 * - Validates that req.user.companyId is set
 * - Ready to validate resource ownership in controllers
 */
export const requireTenantAccess = () => {
  return (req, res, next) => {
    try {
      // Verify user is authenticated with tenant context
      if (!req.user) {
        return next(new AppError('Not authenticated', 401));
      }

      if (!req.user.companyId) {
        return next(new AppError('Invalid request: missing tenant context', 400));
      }

      // Store companyId in request for easy access by downstream handlers
      req.companyId = req.user.companyId;

      next();
    } catch (err) {
      next(err);
    }
  };
};

/**
 * Validate Resource Ownership
 * Call this in controllers to verify a resource belongs to the user's company.
 *
 * Usage:
 * const vehicle = await vehicleService.getById(req.params.vehicleId);
 * validateResourceOwnership(vehicle, req.user.companyId, 'Vehicle');
 *
 * @param {Object} resource - The database resource being accessed
 * @param {String} userCompanyId - The authenticated user's companyId
 * @param {String} resourceType - Name of the resource type (for error message)
 * @throws {AppError} If resource does not belong to user's company
 */
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

/**
 * Validate Multiple Resources Ownership
 * Useful for bulk operations where multiple resources must belong to the same company.
 *
 * @param {Array} resources - Array of database resources
 * @param {String} userCompanyId - The authenticated user's companyId
 * @param {String} resourceType - Name of the resource type
 */
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
