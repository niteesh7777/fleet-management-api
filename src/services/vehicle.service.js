// src/services/vehicle.service.js
import VehicleRepository from '../repositories/vehicle.repository.js';
import AppError from '../utils/appError.js';
import DriverRepository from '../repositories/driver.repository.js';

const repo = new VehicleRepository();

export default class VehicleService {
  async createVehicle(data) {
    const existing = await repo.findByVehicleNo(data.vehicleNo);
    if (existing) {
      throw new AppError('Vehicle with this registration number already exists', 400);
    }

    const newVehicle = await repo.create(data);
    return newVehicle;
  }

  async getAllVehicles(filter = {}) {
    return await repo.findAll(filter);
  }

  async getVehicleById(id) {
    const vehicle = await repo.findById(id);
    if (!vehicle) throw new AppError('Vehicle not found', 404);
    return vehicle;
  }

  async updateVehicle(id, updateData) {
    const updated = await repo.update(id, updateData);
    if (!updated) throw new AppError('Vehicle not found', 404);
    return updated;
  }

  async deleteVehicle(id) {
    const deleted = await repo.delete(id);
    if (!deleted) throw new AppError('Vehicle not found', 404);
    return deleted;
  }

  async updateStatus(id, newStatus) {
    const validStatuses = ['available', 'in-trip', 'maintenance'];
    if (!validStatuses.includes(newStatus)) {
      throw new AppError('Invalid vehicle status', 400);
    }

    const updated = await repo.update(id, { status: newStatus });
    if (!updated) throw new AppError('Vehicle not found', 404);
    return updated;
  }

  async isInsuranceExpired(id) {
    const vehicle = await repo.findById(id);
    if (!vehicle) throw new AppError('Vehicle not found', 404);
    return vehicle.isInsuranceExpired();
  }

  async assignDriverToVehicle(vehicleId, driverId) {
    const vehicle = await this.repo.findById(vehicleId);
    if (!vehicle) throw new AppError('Vehicle not found', 404);

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

