import Vehicle from '../models/Vehicle.js';
import { TenantRepository } from './base.repository.js';

export default class VehicleRepository extends TenantRepository {
  constructor() {
    super(Vehicle);
  }

  async findByVehicleNoAndCompany(companyId, vehicleNo) {
    if (!companyId) {
      throw new Error('companyId is required');
    }
    return await this.findOneByCompany(companyId, { vehicleNo });
  }

  async getAllByCompany(companyId, filter = {}) {
    if (!companyId) {
      throw new Error('companyId is required');
    }
    return await this.Model.find({ ...filter, companyId })
      .populate('assignedDrivers', 'licenseNo status')
      .populate('currentTripId', 'tripCode status');
  }

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

  async getByIdAndCompany(vehicleId, companyId) {
    if (!companyId) {
      throw new Error('companyId is required');
    }
    return await this.Model.findOne({ _id: vehicleId, companyId })
      .populate('assignedDrivers', 'licenseNo status')
      .populate('currentTripId', 'tripCode status')
      .populate('maintenanceLogs');
  }

  async createForCompany(companyId, data) {
    if (!companyId) {
      throw new Error('companyId is required');
    }
    return await this.create(companyId, data);
  }

  async updateByIdAndCompany(vehicleId, companyId, updateData) {
    if (!companyId) {
      throw new Error('companyId is required');
    }
    return await super.updateByIdAndCompany(vehicleId, companyId, updateData);
  }

  async deleteByIdAndCompany(vehicleId, companyId) {
    if (!companyId) {
      throw new Error('companyId is required');
    }
    return await super.deleteByIdAndCompany(vehicleId, companyId);
  }

}
