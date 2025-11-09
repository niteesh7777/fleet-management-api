// src/repositories/maintenance.repository.js
import MaintenanceLog from '../models/MaintenanceLog.js';

export default class MaintenanceRepository {
  async create(data) {
    const log = new MaintenanceLog(data);
    return await log.save();
  }

  async findAll(filter = {}) {
    return await MaintenanceLog.find(filter)
      .populate('vehicleId', 'vehicleNo model type status')
      .populate('createdBy', 'name email role')
      .sort({ serviceDate: -1 });
  }

  async findById(id) {
    return await MaintenanceLog.findById(id)
      .populate('vehicleId', 'vehicleNo model type status')
      .populate('createdBy', 'name email role');
  }

  async update(id, updateData) {
    return await MaintenanceLog.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true,
    });
  }

  async delete(id) {
    return await MaintenanceLog.findByIdAndDelete(id);
  }

  async findByVehicle(vehicleId) {
    return await MaintenanceLog.find({ vehicleId }).sort({ serviceDate: -1 });
  }
}
