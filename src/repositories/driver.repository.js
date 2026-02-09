import DriverProfile from '../models/DriverProfile.js';
import { TenantRepository } from './base.repository.js';

export default class DriverRepository extends TenantRepository {
  constructor() {
    super(DriverProfile);
  }

  async getAllByCompany(companyId, filter = {}) {
    if (!companyId) {
      throw new Error('companyId is required');
    }

    const drivers = await this.Model.find({ ...filter, companyId })
      .populate('userId', 'name email platformRole companyRole')
      .populate('assignedVehicle', 'vehicleNo model type status')
      .populate('activeTripId', 'tripCode status');

    return drivers.map((d) => {
      const driver = d.toObject();
      driver.user = driver.userId;
      delete driver.userId;
      return driver;
    });
  }

  async getAllByCompanyPaginated(companyId, filter = {}, options = {}) {
    if (!companyId) {
      throw new Error('companyId is required');
    }

    const { skip = 0, limit = 10, sort = { createdAt: -1 } } = options;
    const fullFilter = { ...filter, companyId };

    const [drivers, total] = await Promise.all([
      this.Model.find(fullFilter)
        .populate('userId', 'name email platformRole companyRole')
        .populate('assignedVehicle', 'vehicleNo model type status')
        .populate('activeTripId', 'tripCode status')
        .sort(sort)
        .skip(skip)
        .limit(limit),
      this.Model.countDocuments(fullFilter),
    ]);

    const transformedDrivers = drivers.map((d) => {
      const driver = d.toObject();
      driver.user = driver.userId;
      delete driver.userId;
      return driver;
    });

    return { drivers: transformedDrivers, total };
  }

  async getByIdAndCompany(driverId, companyId) {
    if (!companyId) {
      throw new Error('companyId is required');
    }

    const driver = await this.Model.findOne({ _id: driverId, companyId })
      .populate('userId', 'name email platformRole companyRole')
      .populate('assignedVehicle', 'vehicleNo model type status')
      .populate('activeTripId', 'tripCode status');

    if (!driver) return null;

    const driverObj = driver.toObject();
    driverObj.user = driverObj.userId;
    delete driverObj.userId;
    return driverObj;
  }

  async createForCompany(companyId, data) {
    if (!companyId) {
      throw new Error('companyId is required');
    }
    return await this.create(companyId, data);
  }

  async updateByIdAndCompany(driverId, companyId, updateData) {
    if (!companyId) {
      throw new Error('companyId is required');
    }

    return await super.updateByIdAndCompany(driverId, companyId, updateData);
  }

  async deleteByIdAndCompany(driverId, companyId) {
    if (!companyId) {
      throw new Error('companyId is required');
    }
    return await super.deleteByIdAndCompany(driverId, companyId);
  }

  async findByUserIdAndCompany(companyId, userId) {
    if (!companyId) {
      throw new Error('companyId is required');
    }

    const driver = await this.Model.findOne({ companyId, userId })
      .populate('userId', 'name email platformRole companyRole')
      .populate('assignedVehicle', 'vehicleNo model type status capacityKg')
      .populate('activeTripId', 'tripCode status startTime endTime');

    if (!driver) return null;

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

    const driverObj = driver.toObject();
    driverObj.user = driverObj.userId;
    delete driverObj.userId;
    return driverObj;
  }

  async updateLocation(driverId, companyId, location) {
    if (!companyId) {
      throw new Error('companyId is required');
    }

    const driver = await this.Model.findOneAndUpdate(
      { _id: driverId, companyId },
      {
        $set: {
          currentLocation: location,
        },
      },
      { new: true }
    )
      .populate('userId', 'name email platformRole companyRole')
      .populate('assignedVehicle', 'vehicleNo model type status')
      .populate('activeTripId', 'tripCode status');

    if (!driver) return null;

    const driverObj = driver.toObject();
    driverObj.user = driverObj.userId;
    delete driverObj.userId;
    return driverObj;
  }
}
