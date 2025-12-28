import Client from '../models/Client.js';
import { TenantRepository } from './base.repository.js';

export default class ClientRepository extends TenantRepository {
  constructor() {
    super(Client);
  }

  /**
   * Get all clients for a company
   * @param {String} companyId - Company ObjectId
   * @param {Object} filter - Additional filters
   * @returns {Promise<Array>}
   */
  async getAllByCompany(companyId, filter = {}) {
    if (!companyId) {
      throw new Error('companyId is required');
    }
    return await this.Model.find({ ...filter, companyId }).populate({
      path: 'trips',
      select: 'tripCode status startTime endTime',
    });
  }

  /**
   * Get paginated clients for a company
   * @param {String} companyId - Company ObjectId
   * @param {Object} filter - Additional filters
   * @param {Object} options - { skip, limit, sort }
   * @returns {Promise<{clients: Array, total: Number}>}
   */
  async getAllByCompanyPaginated(companyId, filter = {}, options = {}) {
    if (!companyId) {
      throw new Error('companyId is required');
    }

    const { skip = 0, limit = 10, sort = { createdAt: -1 } } = options;
    const fullFilter = { ...filter, companyId };

    const [clients, total] = await Promise.all([
      this.Model.find(fullFilter)
        .populate({
          path: 'trips',
          select: 'tripCode status startTime endTime',
        })
        .sort(sort)
        .skip(skip)
        .limit(limit),
      this.Model.countDocuments(fullFilter),
    ]);

    return { clients, total };
  }

  /**
   * Find client by ID for a company
   * @param {String} clientId - Client ObjectId
   * @param {String} companyId - Company ObjectId
   * @returns {Promise<Object|null>}
   */
  async getByIdAndCompany(clientId, companyId) {
    if (!companyId) {
      throw new Error('companyId is required');
    }
    return await this.Model.findOne({ _id: clientId, companyId }).populate({
      path: 'trips',
      select: 'tripCode status startTime endTime',
    });
  }

  /**
   * Create client for company
   * @param {String} companyId - Company ObjectId
   * @param {Object} data - Client data
   * @returns {Promise<Object>}
   */
  async createForCompany(companyId, data) {
    if (!companyId) {
      throw new Error('companyId is required');
    }
    return await this.create(companyId, data);
  }

  /**
   * Update client for company
   * @param {String} clientId - Client ObjectId
   * @param {String} companyId - Company ObjectId
   * @param {Object} updateData - Fields to update
   * @returns {Promise<Object|null>}
   */
  async updateByIdAndCompany(clientId, companyId, updateData) {
    if (!companyId) {
      throw new Error('companyId is required');
    }
    return await super.updateByIdAndCompany(clientId, companyId, updateData);
  }

  /**
   * Delete client for company
   * @param {String} clientId - Client ObjectId
   * @param {String} companyId - Company ObjectId
   * @returns {Promise<Object|null>}
   */
  async deleteByIdAndCompany(clientId, companyId) {
    if (!companyId) {
      throw new Error('companyId is required');
    }
    return await super.deleteByIdAndCompany(clientId, companyId);
  }
}
