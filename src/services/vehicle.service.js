// src/services/vehicle.service.js
import VehicleRepository from '../repositories/vehicle.repository.js';
import AppError from '../utils/appError.js';

const repo = new VehicleRepository();

export default class VehicleService {
  // Create a new vehicle
  async createVehicle(data) {
    // Prevent duplicate vehicle number
    const existing = await repo.findByVehicleNo(data.vehicleNo);
    if (existing) {
      throw new AppError('Vehicle with this registration number already exists', 400);
    }

    const newVehicle = await repo.create(data);
    return newVehicle;
  }

  // Fetch all vehicles (with optional filter)
  async getAllVehicles(filter = {}) {
    return await repo.findAll(filter);
  }

  // Fetch a single vehicle by ID
  async getVehicleById(id) {
    const vehicle = await repo.findById(id);
    if (!vehicle) throw new AppError('Vehicle not found', 404);
    return vehicle;
  }

  // Update vehicle details
  async updateVehicle(id, updateData) {
    const updated = await repo.update(id, updateData);
    if (!updated) throw new AppError('Vehicle not found', 404);
    return updated;
  }

  // Delete a vehicle
  async deleteVehicle(id) {
    const deleted = await repo.delete(id);
    if (!deleted) throw new AppError('Vehicle not found', 404);
    return deleted;
  }

  // Change vehicle status (for internal use, e.g. trip start)
  async updateStatus(id, newStatus) {
    const validStatuses = ['available', 'in-trip', 'maintenance'];
    if (!validStatuses.includes(newStatus)) {
      throw new AppError('Invalid vehicle status', 400);
    }

    const updated = await repo.update(id, { status: newStatus });
    if (!updated) throw new AppError('Vehicle not found', 404);
    return updated;
  }

  // Check insurance validity
  async isInsuranceExpired(id) {
    const vehicle = await repo.findById(id);
    if (!vehicle) throw new AppError('Vehicle not found', 404);
    return vehicle.isInsuranceExpired();
  }
}
