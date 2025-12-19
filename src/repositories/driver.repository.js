import DriverProfile from '../models/DriverProfile.js';

export default class DriverRepository {
  async create(data) {
    const driver = new DriverProfile(data);
    return await driver.save();
  }

  async findAll(filter = {}) {
    return await DriverProfile.find(filter)
      .populate('userId', 'name email role') // attach user basic info
      .populate('assignedVehicle', 'vehicleNo model type status')
      .populate('activeTripId', 'tripCode status');
  }

  async findAllPaginated(filter = {}, { skip = 0, limit = 10, sort = { createdAt: -1 } } = {}) {
    const [drivers, total] = await Promise.all([
      DriverProfile.find(filter)
        .populate('userId', 'name email role')
        .populate('assignedVehicle', 'vehicleNo model type status')
        .populate('activeTripId', 'tripCode status')
        .sort(sort)
        .skip(skip)
        .limit(limit),
      DriverProfile.countDocuments(filter),
    ]);

    return { drivers, total };
  }

  async findById(id) {
    return await DriverProfile.findById(id)
      .populate('userId', 'name email role')
      .populate('assignedVehicle', 'vehicleNo model type status')
      .populate('activeTripId', 'tripCode status');
  }

  async update(id, updateData) {
    return await DriverProfile.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true,
    });
  }

  async delete(id) {
    // Soft delete → deactivate driver instead of removing document
    return await DriverProfile.findByIdAndUpdate(id, { status: 'inactive' }, { new: true });
  }
}
