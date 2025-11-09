// src/services/driver.service.js
import DriverRepository from '../repositories/driver.repository.js';
import AppError from '../utils/appError.js';

const repo = new DriverRepository();

export default class DriverService {
  // Create new driver profile
  async createDriver(data) {
    // Check if driver already exists by license or userId
    const existingByLicense = await repo.findAll({ licenseNo: data.licenseNo });
    if (existingByLicense.length > 0) {
      throw new AppError('Driver with this license number already exists', 400);
    }

    const existingByUser = await repo.findAll({ userId: data.userId });
    if (existingByUser.length > 0) {
      throw new AppError('User already linked to a driver profile', 400);
    }

    const newDriver = await repo.create(data);
    return newDriver;
  }

  // Get all drivers (with optional filters)
  async getAllDrivers(filter = {}) {
    return await repo.findAll(filter);
  }

  // Get driver by ID
  async getDriverById(id) {
    const driver = await repo.findById(id);
    if (!driver) throw new AppError('Driver not found', 404);
    return driver;
  }

  // Update driver info
  async updateDriver(id, updateData) {
    const updated = await repo.update(id, updateData);
    if (!updated) throw new AppError('Driver not found', 404);
    return updated;
  }

  // Soft delete driver
  async deleteDriver(id) {
    const deleted = await repo.delete(id);
    if (!deleted) throw new AppError('Driver not found', 404);
    return deleted;
  }
}
