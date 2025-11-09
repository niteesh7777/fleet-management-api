// src/repositories/vehicle.repository.js
import Vehicle from '../models/Vehicle.js';

export default class VehicleRepository {
  async create(data) {
    const vehicle = new Vehicle(data);
    return await vehicle.save();
  }

  async findAll(filter = {}) {
    return await Vehicle.find(filter)
      .populate('assignedDrivers', 'licenseNo status')
      .populate('currentTripId', 'tripCode status');
  }

  async findById(id) {
    return await Vehicle.findById(id)
      .populate('assignedDrivers', 'licenseNo status')
      .populate('currentTripId', 'tripCode status')
      .populate('maintenanceLogs');
  }

  async update(id, updateData) {
    return await Vehicle.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true,
    });
  }

  async delete(id) {
    return await Vehicle.findByIdAndDelete(id);
  }

  async findByVehicleNo(vehicleNo) {
    return await Vehicle.findOne({ vehicleNo });
  }
}
