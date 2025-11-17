import Trip from '../models/Trip.js';

export default class TripRepository {
  async create(data) {
    const trip = new Trip(data);
    return await trip.save();
  }

  async findAll(filter = {}) {
    return await Trip.find(filter)
      .populate('clientId', 'name type')
      .populate('routeId', 'name source destination distanceKm')
      .populate('vehicleIds', 'vehicleNo model type status')
      .populate('driverIds', 'licenseNo status')
      .sort({ createdAt: -1 });
  }

  async findById(id) {
    return await Trip.findById(id)
      .populate('clientId', 'name type')
      .populate('routeId', 'name source destination distanceKm')
      .populate('vehicleIds', 'vehicleNo model type status')
      .populate('driverIds', 'licenseNo status');
  }

  async update(id, updateData) {
    return await Trip.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true,
    });
  }

  async delete(id) {
    return await Trip.findByIdAndDelete(id);
  }
}
