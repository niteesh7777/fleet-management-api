/**
 * Subscription Plan Configuration
 * Defines plan tiers, limits, and features for the SaaS platform
 */

export const PLAN_TYPES = {
  FREE: 'free',
  STARTER: 'starter',
  PROFESSIONAL: 'professional',
  ENTERPRISE: 'enterprise',
};

export const COMPANY_STATUS = {
  ACTIVE: 'active',
  SUSPENDED: 'suspended',
  CANCELLED: 'cancelled',
};

/**
 * Plan Limits Configuration
 * Each plan defines resource limits and features
 */
export const PLAN_LIMITS = {
  [PLAN_TYPES.FREE]: {
    name: 'Free Plan',
    maxVehicles: 5,
    maxDrivers: 3,
    maxUsers: 1,
    maxTripsPerMonth: 100,
    maxClientsPerMonth: 50,
    features: {
      analytics: false,
      apiAccess: false,
      customRoles: false,
      advancedReporting: false,
      webhooks: false,
      prioritySupport: false,
    },
  },
  [PLAN_TYPES.STARTER]: {
    name: 'Starter Plan',
    maxVehicles: 25,
    maxDrivers: 15,
    maxUsers: 5,
    maxTripsPerMonth: 1000,
    maxClientsPerMonth: 500,
    features: {
      analytics: true,
      apiAccess: true,
      customRoles: false,
      advancedReporting: false,
      webhooks: false,
      prioritySupport: false,
    },
  },
  [PLAN_TYPES.PROFESSIONAL]: {
    name: 'Professional Plan',
    maxVehicles: 100,
    maxDrivers: 50,
    maxUsers: 20,
    maxTripsPerMonth: 10000,
    maxClientsPerMonth: 5000,
    features: {
      analytics: true,
      apiAccess: true,
      customRoles: true,
      advancedReporting: true,
      webhooks: false,
      prioritySupport: true,
    },
  },
  [PLAN_TYPES.ENTERPRISE]: {
    name: 'Enterprise Plan',
    maxVehicles: Infinity,
    maxDrivers: Infinity,
    maxUsers: Infinity,
    maxTripsPerMonth: Infinity,
    maxClientsPerMonth: Infinity,
    features: {
      analytics: true,
      apiAccess: true,
      customRoles: true,
      advancedReporting: true,
      webhooks: true,
      prioritySupport: true,
    },
  },
};

/**
 * Get plan limits for a given plan type
 * @param {string} planType - Plan type (free, starter, professional, enterprise)
 * @returns {object} Plan limits configuration
 */
export const getPlanLimits = (planType) => {
  return PLAN_LIMITS[planType] || PLAN_LIMITS[PLAN_TYPES.FREE];
};

/**
 * Check if a plan has a specific feature
 * @param {string} planType - Plan type
 * @param {string} feature - Feature name
 * @returns {boolean} Whether the plan has the feature
 */
export const hasFeature = (planType, feature) => {
  const limits = getPlanLimits(planType);
  return limits.features[feature] || false;
};

/**
 * Get all available plan types
 * @returns {array} Array of plan type strings
 */
export const getAllPlanTypes = () => {
  return Object.values(PLAN_TYPES);
};

/**
 * Check if a plan type is valid
 * @param {string} planType - Plan type to validate
 * @returns {boolean} Whether the plan type is valid
 */
export const isValidPlan = (planType) => {
  return getAllPlanTypes().includes(planType);
};

/**
 * Get plan display name
 * @param {string} planType - Plan type
 * @returns {string} Display name for the plan
 */
export const getPlanName = (planType) => {
  const limits = getPlanLimits(planType);
  return limits.name;
};

/**
 * Default plan for new companies
 */
export const DEFAULT_PLAN = PLAN_TYPES.FREE;

/**
 * Default plan limits for new companies
 */
export const DEFAULT_LIMITS = PLAN_LIMITS[DEFAULT_PLAN];
