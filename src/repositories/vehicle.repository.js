import Vehicle from '../models/Vehicle.js';
import { TenantRepository } from './base.repository.js';

export default class VehicleRepository extends TenantRepository {
  constructor() {
    super(Vehicle);
  }

  /**
   * Find vehicle by registration number within a company
   * @param {String} companyId - Company ObjectId
   * @param {String} vehicleNo - Vehicle registration number
   * @returns {Promise<Object|null>}
   */
  async findByVehicleNoAndCompany(companyId, vehicleNo) {
    if (!companyId) {
      throw new Error('companyId is required');
    }
    return await this.findOneByCompany(companyId, { vehicleNo });
  }

  /**
   * Get all vehicles for a company (with optional pagination)
   * @param {String} companyId - Company ObjectId
   * @param {Object} filter - Additional filters
   * @returns {Promise<Array>}
   */
  async getAllByCompany(companyId, filter = {}) {
    if (!companyId) {
      throw new Error('companyId is required');
    }
    return await this.Model.find({ ...filter, companyId })
      .populate('assignedDrivers', 'licenseNo status')
      .populate('currentTripId', 'tripCode status');
  }

  /**
   * Get paginated vehicles for a company
   * @param {String} companyId - Company ObjectId
   * @param {Object} filter - Additional filters
   * @param {Object} options - { skip, limit, sort }
   * @returns {Promise<{docs: Array, total: Number}>}
   */
  async getAllByCompanyPaginated(companyId, filter = {}, options = {}) {
    if (!companyId) {
      throw new Error('companyId is required');
    }

    const { skip = 0, limit = 10, sort = { createdAt: -1 } } = options;
    const fullFilter = { ...filter, companyId };

    const [vehicles, total] = await Promise.all([
      this.Model.find(fullFilter)
        .populate('assignedDrivers', 'licenseNo status')
        .populate('currentTripId', 'tripCode status')
        .sort(sort)
        .skip(skip)
        .limit(limit),
      this.Model.countDocuments(fullFilter),
    ]);

    return { vehicles, total };
  }

  /**
   * Get vehicle by ID with full population for a company
   * @param {String} vehicleId - Vehicle ObjectId
   * @param {String} companyId - Company ObjectId
   * @returns {Promise<Object|null>}
   */
  async getByIdAndCompany(vehicleId, companyId) {
    if (!companyId) {
      throw new Error('companyId is required');
    }
    return await this.Model.findOne({ _id: vehicleId, companyId })
      .populate('assignedDrivers', 'licenseNo status')
      .populate('currentTripId', 'tripCode status')
      .populate('maintenanceLogs');
  }

  /**
   * Create vehicle for company
   * @param {String} companyId - Company ObjectId
   * @param {Object} data - Vehicle data
   * @returns {Promise<Object>}
   */
  async createForCompany(companyId, data) {
    if (!companyId) {
      throw new Error('companyId is required');
    }
    return await this.create(companyId, data);
  }

  /**
   * Update vehicle for company
   * @param {String} vehicleId - Vehicle ObjectId
   * @param {String} companyId - Company ObjectId
   * @param {Object} updateData - Fields to update
   * @returns {Promise<Object|null>}
   */
  async updateByIdAndCompany(vehicleId, companyId, updateData) {
    if (!companyId) {
      throw new Error('companyId is required');
    }
    return await super.updateByIdAndCompany(vehicleId, companyId, updateData);
  }

  /**
   * Delete vehicle for company
   * @param {String} vehicleId - Vehicle ObjectId
   * @param {String} companyId - Company ObjectId
   * @returns {Promise<Object|null>}
   */
  async deleteByIdAndCompany(vehicleId, companyId) {
    if (!companyId) {
      throw new Error('companyId is required');
    }
    return await super.deleteByIdAndCompany(vehicleId, companyId);
  }

  // TODO: Implement legacy method compatibility if needed
  // These methods should throw helpful errors directing to company-scoped versions
}
