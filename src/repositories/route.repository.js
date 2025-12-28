import Route from '../models/Route.js';
import { TenantRepository } from './base.repository.js';

export default class RouteRepository extends TenantRepository {
  constructor() {
    super(Route);
  }

  /**
   * Get all routes for a company
   * @param {String} companyId - Company ObjectId
   * @param {Object} filter - Additional filters
   * @returns {Promise<Array>}
   */
  async getAllByCompany(companyId, filter = {}) {
    if (!companyId) {
      throw new Error('companyId is required');
    }
    return await this.Model.find({ ...filter, companyId })
      .populate('createdBy', 'name email platformRole companyRole')
      .sort({ createdAt: -1 });
  }

  /**
   * Get paginated routes for a company
   * @param {String} companyId - Company ObjectId
   * @param {Object} filter - Additional filters
   * @param {Object} options - { skip, limit, sort }
   * @returns {Promise<{routes: Array, total: Number}>}
   */
  async getAllByCompanyPaginated(companyId, filter = {}, options = {}) {
    if (!companyId) {
      throw new Error('companyId is required');
    }

    const { skip = 0, limit = 10, sort = { createdAt: -1 } } = options;
    const fullFilter = { ...filter, companyId };

    const [routes, total] = await Promise.all([
      this.Model.find(fullFilter)
        .populate('createdBy', 'name email platformRole companyRole')
        .sort(sort)
        .skip(skip)
        .limit(limit),
      this.Model.countDocuments(fullFilter),
    ]);

    return { routes, total };
  }

  /**
   * Find route by ID for a company
   * @param {String} routeId - Route ObjectId
   * @param {String} companyId - Company ObjectId
   * @returns {Promise<Object|null>}
   */
  async getByIdAndCompany(routeId, companyId) {
    if (!companyId) {
      throw new Error('companyId is required');
    }
    return await this.Model.findOne({ _id: routeId, companyId }).populate(
      'createdBy',
      'name email platformRole companyRole'
    );
  }

  /**
   * Create route for company
   * @param {String} companyId - Company ObjectId
   * @param {Object} data - Route data
   * @returns {Promise<Object>}
   */
  async createForCompany(companyId, data) {
    if (!companyId) {
      throw new Error('companyId is required');
    }
    return await this.create(companyId, data);
  }

  /**
   * Update route for company
   * @param {String} routeId - Route ObjectId
   * @param {String} companyId - Company ObjectId
   * @param {Object} updateData - Fields to update
   * @returns {Promise<Object|null>}
   */
  async updateByIdAndCompany(routeId, companyId, updateData) {
    if (!companyId) {
      throw new Error('companyId is required');
    }
    return await super.updateByIdAndCompany(routeId, companyId, updateData);
  }

  /**
   * Delete route for company
   * @param {String} routeId - Route ObjectId
   * @param {String} companyId - Company ObjectId
   * @returns {Promise<Object|null>}
   */
  async deleteByIdAndCompany(routeId, companyId) {
    if (!companyId) {
      throw new Error('companyId is required');
    }
    return await super.deleteByIdAndCompany(routeId, companyId);
  }
}
