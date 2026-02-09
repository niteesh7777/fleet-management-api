import MaintenanceLog from '../models/MaintenanceLog.js';
import { TenantRepository } from './base.repository.js';

export default class MaintenanceRepository extends TenantRepository {
  constructor() {
    super(MaintenanceLog);
  }

  async getAllByCompany(companyId, filter = {}) {
    if (!companyId) {
      throw new Error('companyId is required');
    }
    return await this.Model.find({ ...filter, companyId })
      .populate('vehicleId', 'vehicleNo model type status')
      .populate('createdBy', 'name email platformRole companyRole')
      .sort({ serviceDate: -1 });
  }

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

  async getByIdAndCompany(logId, companyId) {
    if (!companyId) {
      throw new Error('companyId is required');
    }
    return await this.Model.findOne({ _id: logId, companyId })
      .populate('vehicleId', 'vehicleNo model type status')
      .populate('createdBy', 'name email platformRole companyRole');
  }

  async createForCompany(companyId, data) {
    if (!companyId) {
      throw new Error('companyId is required');
    }
    return await this.create(companyId, data);
  }

  async updateByIdAndCompany(logId, companyId, updateData) {
    if (!companyId) {
      throw new Error('companyId is required');
    }
    return await super.updateByIdAndCompany(logId, companyId, updateData);
  }

  async deleteByIdAndCompany(logId, companyId) {
    if (!companyId) {
      throw new Error('companyId is required');
    }
    return await super.deleteByIdAndCompany(logId, companyId);
  }

  async findByVehicleAndCompany(vehicleId, companyId) {
    if (!companyId) {
      throw new Error('companyId is required');
    }
    return await this.Model.find({ vehicleId, companyId }).sort({ serviceDate: -1 });
  }
}
