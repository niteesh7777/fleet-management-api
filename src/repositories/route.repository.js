import Route from '../models/Route.js';
import { TenantRepository } from './base.repository.js';

export default class RouteRepository extends TenantRepository {
  constructor() {
    super(Route);
  }

  async getAllByCompany(companyId, filter = {}) {
    if (!companyId) {
      throw new Error('companyId is required');
    }
    return await this.Model.find({ ...filter, companyId })
      .populate('createdBy', 'name email platformRole companyRole')
      .sort({ createdAt: -1 });
  }

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

  async getByIdAndCompany(routeId, companyId) {
    if (!companyId) {
      throw new Error('companyId is required');
    }
    return await this.Model.findOne({ _id: routeId, companyId }).populate(
      'createdBy',
      'name email platformRole companyRole'
    );
  }

  async createForCompany(companyId, data) {
    if (!companyId) {
      throw new Error('companyId is required');
    }
    return await this.create(companyId, data);
  }

  async updateByIdAndCompany(routeId, companyId, updateData) {
    if (!companyId) {
      throw new Error('companyId is required');
    }
    return await super.updateByIdAndCompany(routeId, companyId, updateData);
  }

  async deleteByIdAndCompany(routeId, companyId) {
    if (!companyId) {
      throw new Error('companyId is required');
    }
    return await super.deleteByIdAndCompany(routeId, companyId);
  }
}
