import MaintenanceRepository from '../repositories/maintenance.repository.js';
import VehicleRepository from '../repositories/vehicle.repository.js';
import AppError from '../utils/appError.js';

const repo = new MaintenanceRepository();
const vehicleRepo = new VehicleRepository();

export default class MaintenanceService {
  async createMaintenance(companyId, userId, data) {
    if (!companyId) throw new AppError('Company context required', 400);
    if (!userId) throw new AppError('User context required', 400);

    const vehicle = await vehicleRepo.getByIdAndCompany(data.vehicleId, companyId);
    if (!vehicle) throw new AppError('Vehicle not found', 404);

    const log = await repo.createForCompany(companyId, {
      ...data,
      createdBy: userId,
    });

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

export const checkMaintenanceReminders = async () => {
  const Vehicle = (await import('../models/Vehicle.js')).default;
  const Company = (await import('../models/Company.js')).default;
  const User = (await import('../models/User.js')).default;

  const reminders = [];
  const now = new Date();
  const reminderWindow = 7;

  const companies = await Company.find({ status: 'active' });

  for (const company of companies) {

    const vehicles = await Vehicle.find({
      companyId: company._id,
      status: { $in: ['available', 'in-trip'] },
      $or: [

        {
          'insurance.expiryDate': {
            $lte: new Date(now.getTime() + reminderWindow * 24 * 60 * 60 * 1000),
            $gte: now,
          },
        },

        {
          lastServiceDate: {
            $lte: new Date(now.getTime() - 180 * 24 * 60 * 60 * 1000),
          },
        },
      ],
    });

    if (vehicles.length === 0) continue;

    const owner = await User.findOne({
      companyId: company._id,
      companyRole: 'company_owner',
    });

    if (!owner) continue;

    for (const vehicle of vehicles) {
      let maintenanceType = 'General Maintenance';
      let dueDate = null;

      if (
        vehicle.insurance?.expiryDate &&
        new Date(vehicle.insurance.expiryDate) <=
          new Date(now.getTime() + reminderWindow * 24 * 60 * 60 * 1000)
      ) {
        maintenanceType = 'Insurance Renewal';
        dueDate = vehicle.insurance.expiryDate;
      }

      else if (
        vehicle.lastServiceDate &&
        new Date(vehicle.lastServiceDate) <= new Date(now.getTime() - 180 * 24 * 60 * 60 * 1000)
      ) {
        maintenanceType = 'Scheduled Service';
        dueDate = new Date(new Date(vehicle.lastServiceDate).getTime() + 180 * 24 * 60 * 60 * 1000);
      }

      reminders.push({
        companyId: company._id,
        vehicleId: vehicle._id,
        vehicleNo: vehicle.vehicleNo,
        maintenanceType,
        dueDate,
        currentMileage: vehicle.currentMileage || 0,
        ownerEmail: owner.email,
      });
    }
  }

  console.log(`✅ Found ${reminders.length} maintenance reminders`);
  return reminders;
};
