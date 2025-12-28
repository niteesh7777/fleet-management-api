import Trip from '../models/Trip.js';
import { TenantRepository } from './base.repository.js';

export default class TripRepository extends TenantRepository {
  constructor() {
    super(Trip);
  }

  /**
   * Get all trips for a company
   * @param {String} companyId - Company ObjectId
   * @param {Object} filter - Additional filters
   * @returns {Promise<Array>}
   */
  async getAllByCompany(companyId, filter = {}) {
    if (!companyId) {
      throw new Error('companyId is required');
    }
    return await this.Model.find({ ...filter, companyId })
      .populate('clientId', 'name type')
      .populate('routeId', 'name source destination distanceKm')
      .populate('vehicleIds', 'vehicleNo model type status')
      .populate('driverIds', 'licenseNo status')
      .sort({ createdAt: -1 });
  }

  /**
   * Get paginated trips for a company
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

    const [trips, total] = await Promise.all([
      this.Model.find(fullFilter)
        .populate('clientId', 'name type')
        .populate('routeId', 'name source destination distanceKm')
        .populate('vehicleIds', 'vehicleNo model type status')
        .populate('driverIds', 'licenseNo status')
        .sort(sort)
        .skip(skip)
        .limit(limit),
      this.Model.countDocuments(fullFilter),
    ]);

    return { trips, total };
  }

  /**
   * Get trip by ID for a company
   * @param {String} tripId - Trip ObjectId
   * @param {String} companyId - Company ObjectId
   * @returns {Promise<Object|null>}
   */
  async getByIdAndCompany(tripId, companyId) {
    if (!companyId) {
      throw new Error('companyId is required');
    }
    return await this.Model.findOne({ _id: tripId, companyId })
      .populate('clientId', 'name type')
      .populate('routeId', 'name source destination distanceKm')
      .populate('vehicleIds', 'vehicleNo model type status')
      .populate('driverIds', 'licenseNo status');
  }

  /**
   * Create trip for company
   * @param {String} companyId - Company ObjectId
   * @param {Object} data - Trip data
   * @returns {Promise<Object>}
   */
  async createForCompany(companyId, data) {
    if (!companyId) {
      throw new Error('companyId is required');
    }
    return await this.create(companyId, data);
  }

  /**
   * Update trip for company
   * @param {String} tripId - Trip ObjectId
   * @param {String} companyId - Company ObjectId
   * @param {Object} updateData - Fields to update
   * @returns {Promise<Object|null>}
   */
  async updateByIdAndCompany(tripId, companyId, updateData) {
    if (!companyId) {
      throw new Error('companyId is required');
    }
    return await super.updateByIdAndCompany(tripId, companyId, updateData);
  }

  /**
   * Delete trip for company
   * @param {String} tripId - Trip ObjectId
   * @param {String} companyId - Company ObjectId
   * @returns {Promise<Object|null>}
   */
  async deleteByIdAndCompany(tripId, companyId) {
    if (!companyId) {
      throw new Error('companyId is required');
    }
    return await super.deleteByIdAndCompany(tripId, companyId);
  }
}
