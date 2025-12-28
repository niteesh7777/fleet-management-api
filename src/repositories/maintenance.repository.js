import MaintenanceLog from '../models/MaintenanceLog.js';
import { TenantRepository } from './base.repository.js';

export default class MaintenanceRepository extends TenantRepository {
  constructor() {
    super(MaintenanceLog);
  }

  /**
   * Get all maintenance logs for a company
   * @param {String} companyId - Company ObjectId
   * @param {Object} filter - Additional filters
   * @returns {Promise<Array>}
   */
  async getAllByCompany(companyId, filter = {}) {
    if (!companyId) {
      throw new Error('companyId is required');
    }
    return await this.Model.find({ ...filter, companyId })
      .populate('vehicleId', 'vehicleNo model type status')
      .populate('createdBy', 'name email platformRole companyRole')
      .sort({ serviceDate: -1 });
  }

  /**
   * Get paginated maintenance logs for a company
   * @param {String} companyId - Company ObjectId
   * @param {Object} filter - Additional filters
   * @param {Object} options - { skip, limit, sort }
   * @returns {Promise<{maintenanceLogs: Array, total: Number}>}
   */
  async getAllByCompanyPaginated(companyId, filter = {}, options = {}) {
    if (!companyId) {
      throw new Error('companyId is required');
    }

    const { skip = 0, limit = 10, sort = { serviceDate: -1 } } = options;
    const fullFilter = { ...filter, companyId };

    const [maintenanceLogs, total] = await Promise.all([
      this.Model.find(fullFilter)
        .populate('vehicleId', 'vehicleNo model type status')
        .populate('createdBy', 'name email platformRole companyRole')
        .sort(sort)
        .skip(skip)
        .limit(limit),
      this.Model.countDocuments(fullFilter),
    ]);

    return { maintenanceLogs, total };
  }

  /**
   * Find maintenance log by ID for a company
   * @param {String} logId - MaintenanceLog ObjectId
   * @param {String} companyId - Company ObjectId
   * @returns {Promise<Object|null>}
   */
  async getByIdAndCompany(logId, companyId) {
    if (!companyId) {
      throw new Error('companyId is required');
    }
    return await this.Model.findOne({ _id: logId, companyId })
      .populate('vehicleId', 'vehicleNo model type status')
      .populate('createdBy', 'name email platformRole companyRole');
  }

  /**
   * Create maintenance log for company
   * @param {String} companyId - Company ObjectId
   * @param {Object} data - Maintenance log data
   * @returns {Promise<Object>}
   */
  async createForCompany(companyId, data) {
    if (!companyId) {
      throw new Error('companyId is required');
    }
    return await this.create(companyId, data);
  }

  /**
   * Update maintenance log for company
   * @param {String} logId - MaintenanceLog ObjectId
   * @param {String} companyId - Company ObjectId
   * @param {Object} updateData - Fields to update
   * @returns {Promise<Object|null>}
   */
  async updateByIdAndCompany(logId, companyId, updateData) {
    if (!companyId) {
      throw new Error('companyId is required');
    }
    return await super.updateByIdAndCompany(logId, companyId, updateData);
  }

  /**
   * Delete maintenance log for company
   * @param {String} logId - MaintenanceLog ObjectId
   * @param {String} companyId - Company ObjectId
   * @returns {Promise<Object|null>}
   */
  async deleteByIdAndCompany(logId, companyId) {
    if (!companyId) {
      throw new Error('companyId is required');
    }
    return await super.deleteByIdAndCompany(logId, companyId);
  }

  /**
   * Find maintenance logs by vehicle for a company
   * @param {String} vehicleId - Vehicle ObjectId
   * @param {String} companyId - Company ObjectId
   * @returns {Promise<Array>}
   */
  async findByVehicleAndCompany(vehicleId, companyId) {
    if (!companyId) {
      throw new Error('companyId is required');
    }
    return await this.Model.find({ vehicleId, companyId }).sort({ serviceDate: -1 });
  }
}
