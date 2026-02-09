import DriverRepository from '../repositories/driver.repository.js';
import AppError from '../utils/appError.js';
import UserRepository from '../repositories/user.repository.js';
import CompanyRepository from '../repositories/company.repository.js';
import { validateDriversLimit } from '../utils/planValidation.js';

const repo = new DriverRepository();
const userRepo = new UserRepository();
const companyRepo = new CompanyRepository();

export default class DriverService {

  async createDriver(companyId, data) {
    if (!companyId) {
      throw new AppError('companyId is required', 400);
    }

    const company = await companyRepo.findById(companyId);
    if (!company) {
      throw new AppError('Company not found', 404);
    }

    const currentDriverCount = await repo.countByCompany(companyId);
    validateDriversLimit(company, currentDriverCount);

    return await repo.create(companyId, data);
  }

  async getAllDrivers(companyId, filter = {}) {
    if (!companyId) {
      throw new AppError('companyId is required', 400);
    }
    return await repo.getAllByCompany(companyId, filter);
  }

  async getDriversPaginated(companyId, filter = {}, paginationOptions = {}) {
    if (!companyId) {
      throw new AppError('companyId is required', 400);
    }
    return await repo.getAllByCompanyPaginated(companyId, filter, paginationOptions);
  }

  async getDriverById(companyId, id) {
    if (!companyId) {
      throw new AppError('companyId is required', 400);
    }
    const driver = await repo.getByIdAndCompany(id, companyId);
    if (!driver) throw new AppError('Driver not found', 404);
    return driver;
  }

  async updateDriver(companyId, id, data) {
    if (!companyId) {
      throw new AppError('companyId is required', 400);
    }

    const driver = await repo.getByIdAndCompany(id, companyId);
    if (!driver) throw new AppError('Driver not found', 404);

    const updated = await repo.update(id, data);
    if (!updated) throw new AppError('Driver not found', 404);
    return updated;
  }

  async deleteDriver(companyId, id) {
    if (!companyId) {
      throw new AppError('companyId is required', 400);
    }

    const driver = await repo.getByIdAndCompany(id, companyId);
    if (!driver) throw new AppError('Driver not found', 404);

    const deleted = await repo.delete(id);
    if (!deleted) throw new AppError('Driver not found', 404);
    return deleted;
  }

  async deactivateDriver(companyId, id) {
    if (!companyId) {
      throw new AppError('companyId is required', 400);
    }

    const driver = await repo.getByIdAndCompany(id, companyId);
    if (!driver) throw new AppError('Driver not found', 404);

    await userRepo.findByIdAndUpdate(driver.userId, { isActive: false });

    driver.status = 'inactive';
    driver.assignedVehicle = null;
    await driver.save();

    return driver;
  }

  async updateLocation(companyId, driverId, location) {
    if (!companyId) {
      throw new AppError('companyId is required', 400);
    }

    const driver = await repo.getByIdAndCompany(driverId, companyId);
    if (!driver) throw new AppError('Driver not found', 404);

    const updatedDriver = await repo.updateLocation(driverId, companyId, {
      lat: location.lat,
      lng: location.lng,
      lastUpdated: new Date(),
    });

    return updatedDriver;
  }

  async getDriverProfile(companyId, userId) {
    if (!companyId) {
      throw new AppError('companyId is required', 400);
    }
    const driver = await repo.findByUserIdAndCompany(companyId, userId);
    if (!driver) throw new AppError('Driver profile not found', 404);
    return driver;
  }

  async checkDriverDependencies(companyId, driverId) {
    if (!companyId) {
      throw new AppError('companyId is required', 400);
    }

    const driver = await repo.getByIdAndCompany(driverId, companyId);
    if (!driver) throw new AppError('Driver not found', 404);

    const Trip = (await import('../models/trip.model.js')).default;
    const Vehicle = (await import('../models/vehicle.model.js')).default;

    const activeTrips = await Trip.countDocuments({
      companyId,
      driverId,
      status: { $in: ['pending', 'started', 'in-progress'] },
    });

    const assignedVehicles = await Vehicle.countDocuments({
      companyId,
      assignedDrivers: driverId,
    });

    const blockingReasons = [];
    if (activeTrips > 0) {
      blockingReasons.push(`Driver has ${activeTrips} active trip(s)`);
    }

    return {
      activeTrips,
      assignedVehicles,
      canDelete: activeTrips === 0,
      blockingReasons,
    };
  }

  async bulkDeleteDrivers(companyId, ids) {
    if (!companyId) {
      throw new AppError('companyId is required', 400);
    }

    if (!Array.isArray(ids) || ids.length === 0) {
      throw new AppError('Driver IDs array is required', 400);
    }

    const results = {
      deleted: [],
      failed: [],
      total: ids.length,
    };

    for (const id of ids) {
      try {
        const driver = await repo.getByIdAndCompany(id, companyId);
        if (!driver) {
          results.failed.push({ id, reason: 'Driver not found' });
          continue;
        }

        const dependencies = await this.checkDriverDependencies(companyId, id);
        if (!dependencies.canDelete) {
          results.failed.push({
            id,
            name: driver.user?.name || driver.licenseNo,
            reason: dependencies.blockingReasons.join(', '),
          });
          continue;
        }

        await repo.delete(id);
        results.deleted.push({ id, name: driver.user?.name || driver.licenseNo });
      } catch (error) {
        results.failed.push({ id, reason: error.message });
      }
    }

    return results;
  }
}
