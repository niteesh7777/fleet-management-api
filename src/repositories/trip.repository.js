import Trip from '../models/Trip.js';
import { TenantRepository } from './base.repository.js';

export default class TripRepository extends TenantRepository {
  constructor() {
    super(Trip);
  }

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

  async createForCompany(companyId, data) {
    if (!companyId) {
      throw new Error('companyId is required');
    }
    return await this.create(companyId, data);
  }

  async updateByIdAndCompany(tripId, companyId, updateData) {
    if (!companyId) {
      throw new Error('companyId is required');
    }
    return await super.updateByIdAndCompany(tripId, companyId, updateData);
  }

  async deleteByIdAndCompany(tripId, companyId) {
    if (!companyId) {
      throw new Error('companyId is required');
    }
    return await super.deleteByIdAndCompany(tripId, companyId);
  }
}
