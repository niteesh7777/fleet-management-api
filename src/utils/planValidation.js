/**
 * Plan Validation Utility
 * Reusable functions for validating company subscription limits
 */

import AppError from './appError.js';
import { getPlanLimits, COMPANY_STATUS } from '../constants/plans.js';

/**
 * Check if company is in a valid state for resource creation
 * @param {object} company - Company document
 * @throws {AppError} If company is suspended or cancelled
 */
export const checkCompanyStatus = (company) => {
  if (!company) {
    throw new AppError('Company not found', 404);
  }

  if (company.status === COMPANY_STATUS.SUSPENDED) {
    throw new AppError(
      'Your subscription has been suspended. Please contact support to reactivate.',
      403
    );
  }

  if (company.status === COMPANY_STATUS.CANCELLED) {
    throw new AppError(
      'Your subscription has been cancelled. No new resources can be created.',
      403
    );
  }
};

/**
 * Validate vehicles limit
 * @param {object} company - Company document
 * @param {number} currentCount - Current number of vehicles in company
 * @throws {AppError} If limit is exceeded
 */
export const validateVehiclesLimit = (company, currentCount) => {
  checkCompanyStatus(company);

  const limits = getPlanLimits(company.plan);
  if (currentCount >= limits.maxVehicles) {
    throw new AppError(
      `Vehicle limit reached (${limits.maxVehicles}). Upgrade your plan to add more vehicles.`,
      403
    );
  }
};

/**
 * Validate drivers limit
 * @param {object} company - Company document
 * @param {number} currentCount - Current number of drivers in company
 * @throws {AppError} If limit is exceeded
 */
export const validateDriversLimit = (company, currentCount) => {
  checkCompanyStatus(company);

  const limits = getPlanLimits(company.plan);
  if (currentCount >= limits.maxDrivers) {
    throw new AppError(
      `Driver limit reached (${limits.maxDrivers}). Upgrade your plan to add more drivers.`,
      403
    );
  }
};

/**
 * Validate users limit
 * @param {object} company - Company document
 * @param {number} currentCount - Current number of users in company
 * @throws {AppError} If limit is exceeded
 */
export const validateUsersLimit = (company, currentCount) => {
  checkCompanyStatus(company);

  const limits = getPlanLimits(company.plan);
  if (currentCount >= limits.maxUsers) {
    throw new AppError(
      `User limit reached (${limits.maxUsers}). Upgrade your plan to add more users.`,
      403
    );
  }
};

/**
 * Validate clients limit
 * @param {object} company - Company document
 * @param {number} currentCount - Current number of clients in company
 * @throws {AppError} If limit is exceeded
 */
export const validateClientsLimit = (company, currentCount) => {
  checkCompanyStatus(company);

  const limits = getPlanLimits(company.plan);
  if (currentCount >= limits.maxClientsPerMonth) {
    throw new AppError(
      `Client limit reached (${limits.maxClientsPerMonth}). Upgrade your plan to add more clients.`,
      403
    );
  }
};

/**
 * Get remaining quota for a resource type
 * @param {object} company - Company document
 * @param {string} resourceType - Type of resource (vehicles, drivers, users, clients)
 * @param {number} currentCount - Current number of resources
 * @returns {number} Remaining quota
 */
export const getRemainingQuota = (company, resourceType, currentCount) => {
  const limits = getPlanLimits(company.plan);

  const limitField = {
    vehicles: 'maxVehicles',
    drivers: 'maxDrivers',
    users: 'maxUsers',
    clients: 'maxClientsPerMonth',
  }[resourceType];

  if (!limitField) {
    throw new Error(`Unknown resource type: ${resourceType}`);
  }

  const limit = limits[limitField];
  if (limit === Infinity) {
    return Infinity;
  }

  return Math.max(0, limit - currentCount);
};

/**
 * Get usage percentage for a resource type
 * @param {object} company - Company document
 * @param {string} resourceType - Type of resource
 * @param {number} currentCount - Current number of resources
 * @returns {number} Usage percentage (0-100)
 */
export const getUsagePercentage = (company, resourceType, currentCount) => {
  const limits = getPlanLimits(company.plan);

  const limitField = {
    vehicles: 'maxVehicles',
    drivers: 'maxDrivers',
    users: 'maxUsers',
    clients: 'maxClientsPerMonth',
  }[resourceType];

  if (!limitField) {
    throw new Error(`Unknown resource type: ${resourceType}`);
  }

  const limit = limits[limitField];
  if (limit === Infinity) {
    return 0; // No limit
  }

  return Math.round((currentCount / limit) * 100);
};

/**
 * Check if a feature is available for the company's plan
 * @param {object} company - Company document
 * @param {string} feature - Feature name
 * @throws {AppError} If feature is not available
 */
export const checkFeatureAvailability = (company, feature) => {
  const limits = getPlanLimits(company.plan);
  if (!limits.features[feature]) {
    throw new AppError(
      `Feature "${feature}" is not available in your current plan. Upgrade to unlock this feature.`,
      403
    );
  }
};

/**
 * Get company usage summary for quota dashboard
 * @param {object} company - Company document
 * @param {object} counts - Object with current resource counts
 *   { vehicles: number, drivers: number, users: number, clients: number }
 * @returns {object} Usage summary with remaining quotas and percentages
 */
export const getUsageSummary = (company, counts) => {
  const limits = getPlanLimits(company.plan);

  return {
    plan: company.plan,
    planName: limits.name,
    status: company.status,
    resources: {
      vehicles: {
        current: counts.vehicles || 0,
        limit: limits.maxVehicles,
        remaining: getRemainingQuota(company, 'vehicles', counts.vehicles || 0),
        usagePercentage: getUsagePercentage(company, 'vehicles', counts.vehicles || 0),
        unlimited: limits.maxVehicles === Infinity,
      },
      drivers: {
        current: counts.drivers || 0,
        limit: limits.maxDrivers,
        remaining: getRemainingQuota(company, 'drivers', counts.drivers || 0),
        usagePercentage: getUsagePercentage(company, 'drivers', counts.drivers || 0),
        unlimited: limits.maxDrivers === Infinity,
      },
      users: {
        current: counts.users || 0,
        limit: limits.maxUsers,
        remaining: getRemainingQuota(company, 'users', counts.users || 0),
        usagePercentage: getUsagePercentage(company, 'users', counts.users || 0),
        unlimited: limits.maxUsers === Infinity,
      },
      clients: {
        current: counts.clients || 0,
        limit: limits.maxClientsPerMonth,
        remaining: getRemainingQuota(company, 'clients', counts.clients || 0),
        usagePercentage: getUsagePercentage(company, 'clients', counts.clients || 0),
        unlimited: limits.maxClientsPerMonth === Infinity,
      },
    },
    features: limits.features,
  };
};

export default {
  checkCompanyStatus,
  validateVehiclesLimit,
  validateDriversLimit,
  validateUsersLimit,
  validateClientsLimit,
  getRemainingQuota,
  getUsagePercentage,
  checkFeatureAvailability,
  getUsageSummary,
};
