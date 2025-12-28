// src/services/vehicle.service.js
import VehicleRepository from '../repositories/vehicle.repository.js';
import AppError from '../utils/appError.js';
import DriverRepository from '../repositories/driver.repository.js';
import CompanyRepository from '../repositories/company.repository.js';
import { validateVehiclesLimit } from '../utils/planValidation.js';

const repo = new VehicleRepository();
const companyRepo = new CompanyRepository();
const driverRepo = new DriverRepository();

export default class VehicleService {
  /**
   * Create a new vehicle with plan limit validation
   * @param {string} companyId - Company ObjectId (from JWT)
   * @param {object} data - Vehicle data
   * @throws {AppError} If plan limit exceeded or company suspended
   */
  async createVehicle(companyId, data) {
    if (!companyId) {
      throw new AppError('companyId is required', 400);
    }

    // Validate plan limits before creating vehicle
    const company = await companyRepo.findById(companyId);
    if (!company) {
      throw new AppError('Company not found', 404);
    }

    // Check company status and vehicle limit
    const currentVehicleCount = await repo.countByCompany(companyId);
    validateVehiclesLimit(company, currentVehicleCount);

    // Check for duplicate vehicle number - scoped to company
    const existing = await repo.findByVehicleNoAndCompany(companyId, data.vehicleNo);
    if (existing) {
      throw new AppError('Vehicle with this registration number already exists', 400);
    }

    const newVehicle = await repo.create(companyId, data);
    return newVehicle;
  }

  /**
   * Get all vehicles for a company
   * @param {string} companyId - Company ObjectId (from JWT)
   * @param {object} filter - Additional filters
   */
  async getAllVehicles(companyId, filter = {}) {
    if (!companyId) {
      throw new AppError('companyId is required', 400);
    }
    return await repo.getAllByCompany(companyId, filter);
  }

  /**
   * Get paginated vehicles for a company
   * @param {string} companyId - Company ObjectId (from JWT)
   * @param {object} filter - Additional filters
   * @param {object} paginationOptions - Pagination options
   */
  async getVehiclesPaginated(companyId, filter = {}, paginationOptions = {}) {
    if (!companyId) {
      throw new AppError('companyId is required', 400);
    }
    return await repo.getAllByCompanyPaginated(companyId, filter, paginationOptions);
  }

  /**
   * Get vehicle by ID - scoped to company
   * @param {string} companyId - Company ObjectId (from JWT)
   * @param {string} id - Vehicle ID
   */
  async getVehicleById(companyId, id) {
    if (!companyId) {
      throw new AppError('companyId is required', 400);
    }
    const vehicle = await repo.getByIdAndCompany(id, companyId);
    if (!vehicle) throw new AppError('Vehicle not found', 404);
    return vehicle;
  }

  /**
   * Update vehicle - scoped to company
   * @param {string} companyId - Company ObjectId (from JWT)
   * @param {string} id - Vehicle ID
   * @param {object} updateData - Fields to update
   */
  async updateVehicle(companyId, id, updateData) {
    if (!companyId) {
      throw new AppError('companyId is required', 400);
    }
    // Verify ownership first
    const vehicle = await repo.getByIdAndCompany(id, companyId);
    if (!vehicle) throw new AppError('Vehicle not found', 404);

    const updated = await repo.update(id, updateData);
    if (!updated) throw new AppError('Vehicle not found', 404);
    return updated;
  }

  /**
   * Delete vehicle - scoped to company
   * @param {string} companyId - Company ObjectId (from JWT)
   * @param {string} id - Vehicle ID
   */
  async deleteVehicle(companyId, id) {
    if (!companyId) {
      throw new AppError('companyId is required', 400);
    }
    // Verify ownership first
    const vehicle = await repo.getByIdAndCompany(id, companyId);
    if (!vehicle) throw new AppError('Vehicle not found', 404);

    const deleted = await repo.delete(id);
    if (!deleted) throw new AppError('Vehicle not found', 404);
    return deleted;
  }

  /**
   * Update vehicle status - scoped to company
   * @param {string} companyId - Company ObjectId (from JWT)
   * @param {string} id - Vehicle ID
   * @param {string} newStatus - New status
   */
  async updateStatus(companyId, id, newStatus) {
    if (!companyId) {
      throw new AppError('companyId is required', 400);
    }
    const validStatuses = ['available', 'in-trip', 'maintenance'];
    if (!validStatuses.includes(newStatus)) {
      throw new AppError('Invalid vehicle status', 400);
    }

    // Verify ownership first
    const vehicle = await repo.getByIdAndCompany(id, companyId);
    if (!vehicle) throw new AppError('Vehicle not found', 404);

    const updated = await repo.update(id, { status: newStatus });
    if (!updated) throw new AppError('Vehicle not found', 404);
    return updated;
  }

  /**
   * Check if vehicle insurance is expired - scoped to company
   * @param {string} companyId - Company ObjectId (from JWT)
   * @param {string} id - Vehicle ID
   */
  async isInsuranceExpired(companyId, id) {
    if (!companyId) {
      throw new AppError('companyId is required', 400);
    }
    const vehicle = await repo.getByIdAndCompany(id, companyId);
    if (!vehicle) throw new AppError('Vehicle not found', 404);
    return vehicle.isInsuranceExpired();
  }

  /**
   * Assign driver to vehicle - scoped to company
   * @param {string} companyId - Company ObjectId (from JWT)
   * @param {string} vehicleId - Vehicle ID
   * @param {string} driverId - Driver ID
   */
  async assignDriverToVehicle(companyId, vehicleId, driverId) {
    if (!companyId) {
      throw new AppError('companyId is required', 400);
    }

    const vehicle = await repo.getByIdAndCompany(vehicleId, companyId);
    if (!vehicle) throw new AppError('Vehicle not found', 404);

    // TODO: Get driver repository and verify driver belongs to same company
    // For now, using basic findById - this should be scoped to companyId too
    const driver = await driverRepo.findById(driverId);
    if (!driver) throw new AppError('Driver not found', 404);

    if (vehicle.status === 'in-trip') throw new AppError('Vehicle is currently in a trip', 400);

    if (driver.status === 'on-trip') throw new AppError('Driver is currently on a trip', 400);

    // avoid duplicates
    if (!vehicle.assignedDrivers.includes(driverId)) {
      vehicle.assignedDrivers.push(driverId);
    }

    driver.assignedVehicle = vehicleId;

    await vehicle.save();
    await driver.save();

    return { vehicle, driver };
  }
}
