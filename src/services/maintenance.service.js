// src/services/maintenance.service.js
import MaintenanceRepository from '../repositories/maintenance.repository.js';
import VehicleRepository from '../repositories/vehicle.repository.js';
import AppError from '../utils/appError.js';

const repo = new MaintenanceRepository();
const vehicleRepo = new VehicleRepository();

export default class MaintenanceService {
  async createMaintenance(data) {
    // Ensure vehicle exists
    const vehicle = await vehicleRepo.findById(data.vehicleId);
    if (!vehicle) throw new AppError('Vehicle not found', 404);

    const log = await repo.create(data);

    // Update vehicle status to 'maintenance'
    await vehicleRepo.update(vehicle._id, {
      status: 'maintenance',
    });

    return log;
  }

  async getAllMaintenance(filter = {}) {
    return await repo.findAll(filter);
  }

  async getMaintenanceById(id) {
    const log = await repo.findById(id);
    if (!log) throw new AppError('Maintenance record not found', 404);
    return log;
  }

  async getLogsByVehicle(vehicleId) {
    return await repo.findByVehicle(vehicleId);
  }

  async updateMaintenance(id, updateData) {
    const updated = await repo.update(id, updateData);
    if (!updated) throw new AppError('Maintenance record not found', 404);
    return updated;
  }

  async deleteMaintenance(id) {
    const deleted = await repo.delete(id);
    if (!deleted) throw new AppError('Maintenance record not found', 404);
    return deleted;
  }
}
