import AppError from './appError.js';
import { getPlanLimits, COMPANY_STATUS } from '../constants/plans.js';

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
    return 0;
  }

  return Math.round((currentCount / limit) * 100);
};

export const checkFeatureAvailability = (company, feature) => {
  const limits = getPlanLimits(company.plan);
  if (!limits.features[feature]) {
    throw new AppError(
      `Feature "${feature}" is not available in your current plan. Upgrade to unlock this feature.`,
      403
    );
  }
};

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
