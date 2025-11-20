// src/services/driver.service.js
import DriverRepository from '../repositories/driver.repository.js';
import AppError from '../utils/appError.js';
import UserRepository from '../repositories/user.repository.js'

const repo = new DriverRepository();
const userRepo = new UserRepository();

export default class DriverService {
  async createDriver(data) {
    return await repo.create(data);
  }

  async getAllDrivers() {
    return await repo.findAll();
  }

  async getDriverById(id) {
    const driver = await repo.findById(id);
    if (!driver) throw new AppError('Driver not found', 404);
    return driver;
  }

  async updateDriver(id, data) {
    const updated = await repo.update(id, data);
    if (!updated) throw new AppError('Driver not found', 404);
    return updated;
  }

  async deleteDriver(id) {
    const deleted = await repo.delete(id);
    if (!deleted) throw new AppError('Driver not found', 404);
    return deleted;
  }

  async deactivateDriver(id) {
    const driver = await repo.findById(id);
    if (!driver) throw new AppError('Driver not found', 404);

    // deactivate user
    await userRepo.findByIdAndUpdate(driver.userId, { isActive: false });

    // deactivate driver profile
    driver.status = 'inactive';
    driver.assignedVehicle = null;
    await driver.save();

    return driver;
  }
}
