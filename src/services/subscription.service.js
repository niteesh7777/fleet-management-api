import CompanyRepository from '../repositories/company.repository.js';
import VehicleRepository from '../repositories/vehicle.repository.js';
import DriverRepository from '../repositories/driver.repository.js';
import UserRepository from '../repositories/user.repository.js';
import ClientRepository from '../repositories/client.repository.js';
import AppError from '../utils/appError.js';
import {
  getUsageSummary,
  getPlanLimits,
  hasFeature,
  checkCompanyStatus,
} from '../utils/planValidation.js';
import { PLAN_TYPES, COMPANY_STATUS } from '../constants/plans.js';

const companyRepo = new CompanyRepository();
const vehicleRepo = new VehicleRepository();
const driverRepo = new DriverRepository();
const userRepo = new UserRepository();
const clientRepo = new ClientRepository();

export default class SubscriptionService {

  async getUsageSummary(companyId) {
    const company = await companyRepo.findById(companyId);
    if (!company) {
      throw new AppError('Company not found', 404);
    }

    const vehicleCount = await vehicleRepo.countByCompany(companyId);
    const driverCount = await driverRepo.countByCompany(companyId);
    const userCount = await userRepo.countByCompany(companyId);
    const clientCount = await clientRepo.countByCompany(companyId);

    return getUsageSummary(company, {
      vehicles: vehicleCount,
      drivers: driverCount,
      users: userCount,
      clients: clientCount,
    });
  }

  async upgradePlan(companyId, newPlan, options = {}) {

    if (!Object.values(PLAN_TYPES).includes(newPlan)) {
      throw new AppError('Invalid plan type', 400);
    }

    const company = await companyRepo.findById(companyId);
    if (!company) {
      throw new AppError('Company not found', 404);
    }

    const planRank = { free: 0, starter: 1, professional: 2, enterprise: 3 };
    if (planRank[newPlan] < planRank[company.plan]) {
      throw new AppError('Plan downgrade not allowed. Contact support.', 400);
    }

    const updated = await companyRepo.updateById(companyId, {
      plan: newPlan,
      lastPlanChangeDate: new Date(),
      billingCycle: options.billingCycle || company.billingCycle,
    });

    return {
      message: `Plan upgraded to ${newPlan}`,
      company: updated,
    };
  }

  async suspendCompany(companyId, reason = 'Suspended by administrator') {
    const company = await companyRepo.findById(companyId);
    if (!company) {
      throw new AppError('Company not found', 404);
    }

    if (company.status === COMPANY_STATUS.SUSPENDED) {
      throw new AppError('Company is already suspended', 400);
    }

    const updated = await companyRepo.updateById(companyId, {
      status: COMPANY_STATUS.SUSPENDED,
      suspensionReason: reason,
      suspendedAt: new Date(),
    });

    return {
      message: 'Company suspended successfully',
      company: updated,
    };
  }

  async reactivateCompany(companyId) {
    const company = await companyRepo.findById(companyId);
    if (!company) {
      throw new AppError('Company not found', 404);
    }

    if (company.status !== COMPANY_STATUS.SUSPENDED) {
      throw new AppError('Company is not suspended', 400);
    }

    const updated = await companyRepo.updateById(companyId, {
      status: COMPANY_STATUS.ACTIVE,
      suspensionReason: null,
      suspendedAt: null,
    });

    return {
      message: 'Company reactivated successfully',
      company: updated,
    };
  }

  async checkFeature(companyId, feature) {
    const company = await companyRepo.findById(companyId);
    if (!company) {
      throw new AppError('Company not found', 404);
    }

    checkCompanyStatus(company);

    const limits = getPlanLimits(company.plan);
    const isAvailable = hasFeature(company.plan, feature);

    return {
      feature,
      available: isAvailable,
      plan: company.plan,
      planName: limits.name,
    };
  }

  getPlanComparison() {
    const plans = {};
    Object.entries(PLAN_TYPES).forEach(([, planType]) => {
      const limits = getPlanLimits(planType);
      plans[planType] = {
        name: limits.name,
        limits: {
          maxVehicles: limits.maxVehicles === Infinity ? 'Unlimited' : limits.maxVehicles,
          maxDrivers: limits.maxDrivers === Infinity ? 'Unlimited' : limits.maxDrivers,
          maxUsers: limits.maxUsers === Infinity ? 'Unlimited' : limits.maxUsers,
          maxClientsPerMonth:
            limits.maxClientsPerMonth === Infinity ? 'Unlimited' : limits.maxClientsPerMonth,
          maxTripsPerMonth:
            limits.maxTripsPerMonth === Infinity ? 'Unlimited' : limits.maxTripsPerMonth,
        },
        features: limits.features,
      };
    });
    return plans;
  }

  async estimateUsage(companyId) {
    const company = await companyRepo.findById(companyId);
    if (!company) {
      throw new AppError('Company not found', 404);
    }

    const summary = await this.getUsageSummary(companyId);

    const estimatedMultiplier = 1.2;

    return {
      current: summary.resources,
      estimated: {
        vehicles: Math.ceil(summary.resources.vehicles.current * estimatedMultiplier),
        drivers: Math.ceil(summary.resources.drivers.current * estimatedMultiplier),
        users: Math.ceil(summary.resources.users.current * estimatedMultiplier),
        clients: Math.ceil(summary.resources.clients.current * estimatedMultiplier),
      },
      recommendedPlan: this._recommendPlan(
        summary.resources,
        Math.ceil(summary.resources.vehicles.current * estimatedMultiplier),
        Math.ceil(summary.resources.drivers.current * estimatedMultiplier),
        Math.ceil(summary.resources.users.current * estimatedMultiplier)
      ),
    };
  }

  _recommendPlan(currentUsage, estimatedVehicles, estimatedDrivers, estimatedUsers) {
    const plans = Object.values(PLAN_TYPES);

    for (const plan of plans) {
      const limits = getPlanLimits(plan);
      if (
        estimatedVehicles <= limits.maxVehicles &&
        estimatedDrivers <= limits.maxDrivers &&
        estimatedUsers <= limits.maxUsers
      ) {
        return {
          plan,
          planName: limits.name,
          reason: `Sufficient for estimated usage`,
        };
      }
    }

    return {
      plan: PLAN_TYPES.ENTERPRISE,
      planName: 'Enterprise Plan',
      reason: 'Estimated usage exceeds Professional plan limits',
    };
  }

  async getBillingInfo(companyId) {
    const company = await companyRepo.findById(companyId);
    if (!company) {
      throw new AppError('Company not found', 404);
    }

    const limits = getPlanLimits(company.plan);

    return {
      company: {
        id: company._id,
        name: company.name,
        slug: company.slug,
      },
      subscription: {
        plan: company.plan,
        planName: limits.name,
        status: company.status,
        billingCycle: company.billingCycle,
        startDate: company.subscriptionStartDate,
        endDate: company.subscriptionEndDate,
      },
      billing: {
        email: company.billingEmail,
        subscriptionId: company.subscriptionId,
      },
      lastPlanChange: company.lastPlanChangeDate,
      trialEndsAt: company.trialEndsAt,
    };
  }

  async updateBillingEmail(companyId, billingEmail) {
    const company = await companyRepo.findById(companyId);
    if (!company) {
      throw new AppError('Company not found', 404);
    }

    const updated = await companyRepo.updateById(companyId, {
      billingEmail,
    });

    return updated;
  }

  async getSubscriptionHistory(companyId) {
    const company = await companyRepo.findById(companyId);
    if (!company) {
      throw new AppError('Company not found', 404);
    }

    return {
      company: company._id,
      events: [
        {
          type: 'plan_change',
          date: company.lastPlanChangeDate,
          details: `Current plan: ${company.plan}`,
        },
        {
          type: 'subscription_start',
          date: company.subscriptionStartDate,
          details: 'Subscription started',
        },
        ...(company.suspendedAt
          ? [
              {
                type: 'suspension',
                date: company.suspendedAt,
                details: company.suspensionReason,
              },
            ]
          : []),
      ],
    };
  }
}
