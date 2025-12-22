import DriverProfile from '../models/DriverProfile.js';

export default class DriverRepository {
  async create(data) {
    const driver = new DriverProfile(data);
    return await driver.save();
  }

  async findAll(filter = {}) {
    const drivers = await DriverProfile.find(filter)
      .populate('userId', 'name email role') // attach user basic info
      .populate('assignedVehicle', 'vehicleNo model type status')
      .populate('activeTripId', 'tripCode status');

    // Transform userId to user for API compatibility
    return drivers.map((d) => {
      const driver = d.toObject();
      driver.user = driver.userId;
      delete driver.userId;
      return driver;
    });
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

    // Transform userId to user for API compatibility
    const transformedDrivers = drivers.map((d) => {
      const driver = d.toObject();
      driver.user = driver.userId;
      delete driver.userId;
      return driver;
    });

    return { drivers: transformedDrivers, total };
  }

  async findById(id) {
    const driver = await DriverProfile.findById(id)
      .populate('userId', 'name email role')
      .populate('assignedVehicle', 'vehicleNo model type status')
      .populate('activeTripId', 'tripCode status');

    if (!driver) return null;

    // Transform userId to user for API compatibility
    const driverObj = driver.toObject();
    driverObj.user = driverObj.userId;
    delete driverObj.userId;
    return driverObj;
  }

  async update(id, updateData) {
    const driver = await DriverProfile.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true,
    })
      .populate('userId', 'name email role')
      .populate('assignedVehicle', 'vehicleNo model type status')
      .populate('activeTripId', 'tripCode status');

    if (!driver) return null;

    // Transform userId to user for API compatibility
    const driverObj = driver.toObject();
    driverObj.user = driverObj.userId;
    delete driverObj.userId;
    return driverObj;
  }

  async delete(id) {
    // Soft delete → deactivate driver instead of removing document
    const driver = await DriverProfile.findByIdAndUpdate(
      id,
      { status: 'inactive' },
      { new: true }
    ).populate('userId', 'name email role');

    if (!driver) return null;

    // Transform userId to user for API compatibility
    const driverObj = driver.toObject();
    driverObj.user = driverObj.userId;
    delete driverObj.userId;
    return driverObj;
  }

  async findByUserId(userId) {
    const driver = await DriverProfile.findOne({ userId })
      .populate('userId', 'name email role')
      .populate('assignedVehicle', 'vehicleNo model type status capacityKg')
      .populate('activeTripId', 'tripCode status startTime endTime');

    if (!driver) return null;

    // Transform userId to user for API compatibility
    const driverObj = driver.toObject();
    driverObj.user = driverObj.userId;
    delete driverObj.userId;
    return driverObj;
  }
}
