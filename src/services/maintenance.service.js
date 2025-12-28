// src/services/maintenance.service.js
import MaintenanceRepository from '../repositories/maintenance.repository.js';
import VehicleRepository from '../repositories/vehicle.repository.js';
import AppError from '../utils/appError.js';

const repo = new MaintenanceRepository();
const vehicleRepo = new VehicleRepository();

export default class MaintenanceService {
  async createMaintenance(companyId, userId, data) {
    if (!companyId) throw new AppError('Company context required', 400);
    if (!userId) throw new AppError('User context required', 400);

    // Ensure vehicle belongs to the company
    const vehicle = await vehicleRepo.getByIdAndCompany(data.vehicleId, companyId);
    if (!vehicle) throw new AppError('Vehicle not found', 404);

    const log = await repo.createForCompany(companyId, {
      ...data,
      createdBy: userId,
    });

    // Update vehicle status to 'maintenance'
    await vehicleRepo.updateByIdAndCompany(vehicle._id, companyId, {
      status: 'maintenance',
    });

    return log;
  }

  async getAllMaintenance(companyId, filter = {}) {
    return await repo.getAllByCompany(companyId, filter);
  }

  async getMaintenancePaginated(companyId, filter = {}, paginationOptions = {}) {
    const { maintenanceLogs, total } = await repo.getAllByCompanyPaginated(
      companyId,
      filter,
      paginationOptions
    );

    return { logs: maintenanceLogs, total };
  }

  async getMaintenanceById(id, companyId) {
    const log = await repo.getByIdAndCompany(id, companyId);
    if (!log) throw new AppError('Maintenance record not found', 404);
    return log;
  }

  async getLogsByVehicle(vehicleId, companyId) {
    return await repo.findByVehicleAndCompany(vehicleId, companyId);
  }

  async updateMaintenance(id, companyId, updateData) {
    const updated = await repo.updateByIdAndCompany(id, companyId, updateData);
    if (!updated) throw new AppError('Maintenance record not found', 404);
    return updated;
  }

  async deleteMaintenance(id, companyId) {
    const deleted = await repo.deleteByIdAndCompany(id, companyId);
    if (!deleted) throw new AppError('Maintenance record not found', 404);
    return deleted;
  }
}
