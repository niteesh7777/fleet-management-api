// src/services/vehicle.service.js
import VehicleRepository from '../repositories/vehicle.repository.js';
import AppError from '../utils/appError.js';

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
}
