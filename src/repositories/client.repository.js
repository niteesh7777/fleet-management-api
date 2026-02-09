import Client from '../models/Client.js';
import { TenantRepository } from './base.repository.js';

export default class ClientRepository extends TenantRepository {
  constructor() {
    super(Client);
  }

  async getAllByCompany(companyId, filter = {}) {
    if (!companyId) {
      throw new Error('companyId is required');
    }
    return await this.Model.find({ ...filter, companyId }).populate({
      path: 'trips',
      select: 'tripCode status startTime endTime',
    });
  }

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

  async getByIdAndCompany(clientId, companyId) {
    if (!companyId) {
      throw new Error('companyId is required');
    }
    return await this.Model.findOne({ _id: clientId, companyId }).populate({
      path: 'trips',
      select: 'tripCode status startTime endTime',
    });
  }

  async createForCompany(companyId, data) {
    if (!companyId) {
      throw new Error('companyId is required');
    }
    return await this.create(companyId, data);
  }

  async updateByIdAndCompany(clientId, companyId, updateData) {
    if (!companyId) {
      throw new Error('companyId is required');
    }
    return await super.updateByIdAndCompany(clientId, companyId, updateData);
  }

  async deleteByIdAndCompany(clientId, companyId) {
    if (!companyId) {
      throw new Error('companyId is required');
    }
    return await super.deleteByIdAndCompany(clientId, companyId);
  }

  async findByName(name) {
    return await this.Model.findOne({ name });
  }

  async findByGST(gstNo) {
    return await this.Model.findOne({ gstNo });
  }
}
