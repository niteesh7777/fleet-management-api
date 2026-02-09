import DriverProfile from '../models/DriverProfile.js';
import { TenantRepository } from './base.repository.js';

export default class DriverRepository extends TenantRepository {
  constructor() {
    super(DriverProfile);
  }

  /**
   * Get all drivers for a company
   * @param {String} companyId - Company ObjectId
   * @param {Object} filter - Additional filters
   * @returns {Promise<Array>}
   */
  async getAllByCompany(companyId, filter = {}) {
    if (!companyId) {
      throw new Error('companyId is required');
    }

    const drivers = await this.Model.find({ ...filter, companyId })
      .populate('userId', 'name email platformRole companyRole')
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

  /**
   * Get paginated drivers for a company
   * @param {String} companyId - Company ObjectId
   * @param {Object} filter - Additional filters
   * @param {Object} options - { skip, limit, sort }
   * @returns {Promise<{drivers: Array, total: Number}>}
   */
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

    // Transform userId to user for API compatibility
    const transformedDrivers = drivers.map((d) => {
      const driver = d.toObject();
      driver.user = driver.userId;
      delete driver.userId;
      return driver;
    });

    return { drivers: transformedDrivers, total };
  }

  /**
   * Get driver by ID for a company
   * @param {String} driverId - Driver ObjectId
   * @param {String} companyId - Company ObjectId
   * @returns {Promise<Object|null>}
   */
  async getByIdAndCompany(driverId, companyId) {
    if (!companyId) {
      throw new Error('companyId is required');
    }

    const driver = await this.Model.findOne({ _id: driverId, companyId })
      .populate('userId', 'name email platformRole companyRole')
      .populate('assignedVehicle', 'vehicleNo model type status')
      .populate('activeTripId', 'tripCode status');

    if (!driver) return null;

    // Transform userId to user for API compatibility
    const driverObj = driver.toObject();
    driverObj.user = driverObj.userId;
    delete driverObj.userId;
    return driverObj;
  }

  /**
   * Create driver profile for company
   * @param {String} companyId - Company ObjectId
   * @param {Object} data - Driver profile data
   * @returns {Promise<Object>}
   */
  async createForCompany(companyId, data) {
    if (!companyId) {
      throw new Error('companyId is required');
    }
    return await this.create(companyId, data);
  }

  /**
   * Update driver for company
   * @param {String} driverId - Driver ObjectId
   * @param {String} companyId - Company ObjectId
   * @param {Object} updateData - Fields to update
   * @returns {Promise<Object|null>}
   */
  async updateByIdAndCompany(driverId, companyId, updateData) {
    if (!companyId) {
      throw new Error('companyId is required');
    }

    return await super.updateByIdAndCompany(driverId, companyId, updateData);
  }

  /**
   * Delete driver for company
   * @param {String} driverId - Driver ObjectId
   * @param {String} companyId - Company ObjectId
   * @returns {Promise<Object|null>}
   */
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

    // Transform userId to user for API compatibility
    const driverObj = driver.toObject();
    driverObj.user = driverObj.userId;
    delete driverObj.userId;
    return driverObj;
  }

  /**
   * Update driver location
   * @param {string} driverId - Driver ID
   * @param {string} companyId - Company ObjectId
   * @param {object} location - Location object { lat, lng, lastUpdated }
   * @returns {Promise<Object>}
   */
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

    // Transform userId to user for API compatibility
    const driverObj = driver.toObject();
    driverObj.user = driverObj.userId;
    delete driverObj.userId;
    return driverObj;
  }
}
