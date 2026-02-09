import VehicleRepository from '../repositories/vehicle.repository.js';
import AppError from '../utils/appError.js';
import DriverRepository from '../repositories/driver.repository.js';
import CompanyRepository from '../repositories/company.repository.js';
import { validateVehiclesLimit } from '../utils/planValidation.js';

const repo = new VehicleRepository();
const companyRepo = new CompanyRepository();
const driverRepo = new DriverRepository();

export default class VehicleService {

  async createVehicle(companyId, data) {
    if (!companyId) {
      throw new AppError('companyId is required', 400);
    }

    const company = await companyRepo.findById(companyId);
    if (!company) {
      throw new AppError('Company not found', 404);
    }

    const currentVehicleCount = await repo.countByCompany(companyId);
    validateVehiclesLimit(company, currentVehicleCount);

    const existing = await repo.findByVehicleNoAndCompany(companyId, data.vehicleNo);
    if (existing) {
      throw new AppError('Vehicle with this registration number already exists', 400);
    }

    const newVehicle = await repo.create(companyId, data);
    return newVehicle;
  }

  async getAllVehicles(companyId, filter = {}) {
    if (!companyId) {
      throw new AppError('companyId is required', 400);
    }
    return await repo.getAllByCompany(companyId, filter);
  }

  async getVehiclesPaginated(companyId, filter = {}, paginationOptions = {}) {
    if (!companyId) {
      throw new AppError('companyId is required', 400);
    }
    return await repo.getAllByCompanyPaginated(companyId, filter, paginationOptions);
  }

  async getVehicleById(companyId, id) {
    if (!companyId) {
      throw new AppError('companyId is required', 400);
    }
    const vehicle = await repo.getByIdAndCompany(id, companyId);
    if (!vehicle) throw new AppError('Vehicle not found', 404);
    return vehicle;
  }

  async updateVehicle(companyId, id, updateData) {
    if (!companyId) {
      throw new AppError('companyId is required', 400);
    }

    const vehicle = await repo.getByIdAndCompany(id, companyId);
    if (!vehicle) throw new AppError('Vehicle not found', 404);

    const updated = await repo.update(id, updateData);
    if (!updated) throw new AppError('Vehicle not found', 404);
    return updated;
  }

  async deleteVehicle(companyId, id) {
    if (!companyId) {
      throw new AppError('companyId is required', 400);
    }

    const vehicle = await repo.getByIdAndCompany(id, companyId);
    if (!vehicle) throw new AppError('Vehicle not found', 404);

    const deleted = await repo.delete(id);
    if (!deleted) throw new AppError('Vehicle not found', 404);
    return deleted;
  }

  async updateStatus(companyId, id, newStatus) {
    if (!companyId) {
      throw new AppError('companyId is required', 400);
    }
    const validStatuses = ['available', 'in-trip', 'maintenance'];
    if (!validStatuses.includes(newStatus)) {
      throw new AppError('Invalid vehicle status', 400);
    }

    const vehicle = await repo.getByIdAndCompany(id, companyId);
    if (!vehicle) throw new AppError('Vehicle not found', 404);

    const updated = await repo.update(id, { status: newStatus });
    if (!updated) throw new AppError('Vehicle not found', 404);
    return updated;
  }

  async isInsuranceExpired(companyId, id) {
    if (!companyId) {
      throw new AppError('companyId is required', 400);
    }
    const vehicle = await repo.getByIdAndCompany(id, companyId);
    if (!vehicle) throw new AppError('Vehicle not found', 404);
    return vehicle.isInsuranceExpired();
  }

  async assignDriverToVehicle(companyId, vehicleId, driverId) {
    if (!companyId) {
      throw new AppError('companyId is required', 400);
    }

    const vehicle = await repo.getByIdAndCompany(vehicleId, companyId);
    if (!vehicle) throw new AppError('Vehicle not found', 404);

    const driver = await driverRepo.findById(driverId);
    if (!driver) throw new AppError('Driver not found', 404);

    if (vehicle.status === 'in-trip') throw new AppError('Vehicle is currently in a trip', 400);

    if (driver.status === 'on-trip') throw new AppError('Driver is currently on a trip', 400);

    if (!vehicle.assignedDrivers.includes(driverId)) {
      vehicle.assignedDrivers.push(driverId);
    }

    driver.assignedVehicle = vehicleId;

    await vehicle.save();
    await driver.save();

    return { vehicle, driver };
  }

  async checkVehicleDependencies(companyId, vehicleId) {
    if (!companyId) {
      throw new AppError('companyId is required', 400);
    }

    const vehicle = await repo.getByIdAndCompany(vehicleId, companyId);
    if (!vehicle) throw new AppError('Vehicle not found', 404);

    const Trip = (await import('../models/trip.model.js')).default;

    const activeTrips = await Trip.countDocuments({
      companyId,
      vehicleId,
      status: { $in: ['pending', 'started', 'in-progress'] },
    });

    const assignedDriversCount = vehicle.assignedDrivers?.length || 0;

    const blockingReasons = [];
    if (activeTrips > 0) {
      blockingReasons.push(`Vehicle has ${activeTrips} active trip(s)`);
    }

    return {
      activeTrips,
      assignedDrivers: assignedDriversCount,
      canDelete: activeTrips === 0,
      blockingReasons,
    };
  }

  async bulkDeleteVehicles(companyId, ids) {
    if (!companyId) {
      throw new AppError('companyId is required', 400);
    }

    if (!Array.isArray(ids) || ids.length === 0) {
      throw new AppError('Vehicle IDs array is required', 400);
    }

    const results = {
      deleted: [],
      failed: [],
      total: ids.length,
    };

    for (const id of ids) {
      try {

        const vehicle = await repo.getByIdAndCompany(id, companyId);
        if (!vehicle) {
          results.failed.push({ id, reason: 'Vehicle not found' });
          continue;
        }

        const dependencies = await this.checkVehicleDependencies(companyId, id);
        if (!dependencies.canDelete) {
          results.failed.push({
            id,
            vehicleNo: vehicle.vehicleNo,
            reason: dependencies.blockingReasons.join(', '),
          });
          continue;
        }

        await repo.delete(id);
        results.deleted.push({ id, vehicleNo: vehicle.vehicleNo });
      } catch (error) {
        results.failed.push({ id, reason: error.message });
      }
    }

    return results;
  }
}
