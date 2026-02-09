import User from '../models/User.js';
import { TenantRepository } from './base.repository.js';
import AppError from '../utils/appError.js';

export default class UserRepository extends TenantRepository {
  constructor() {
    super(User);
  }

  async findByEmail(email) {

    return await this.Model.findOne({ email }).select('+passwordHash +refreshTokenJti');
  }

  async findById(userId) {

    return await this.Model.findById(userId).select('+passwordHash +refreshTokenJti');
  }

  async findByEmailAndCompany(companyId, email) {
    if (!companyId) {
      throw new Error('companyId is required');
    }
    return await this.Model.findOne({ companyId, email }).select('+passwordHash +refreshTokenJti');
  }

  async getAllByCompany(companyId, filter = {}) {
    if (!companyId) {
      throw new Error('companyId is required');
    }
    return await this.findByCompany(companyId, filter);
  }

  async getAllByCompanyPaginated(companyId, filter = {}, options = {}) {
    if (!companyId) {
      throw new Error('companyId is required');
    }
    return await this.findByCompanyPaginated(companyId, filter, options);
  }

  async getByIdAndCompany(userId, companyId) {
    if (!companyId) {
      throw new Error('companyId is required');
    }
    return await this.findByIdAndCompany(userId, companyId);
  }

  async createForCompany(companyId, data) {
    if (!companyId) {
      throw new Error('companyId is required');
    }
    return await this.create(companyId, data);
  }

  async updateByIdAndCompany(userId, companyId, updateData) {
    if (!companyId) {
      throw new Error('companyId is required');
    }
    return await super.updateByIdAndCompany(userId, companyId, updateData);
  }

  async clearRefreshToken(userId, companyId = null) {

    if (companyId === null || companyId === undefined) {
      return await this.Model.findByIdAndUpdate(
        userId,
        { refreshTokenJti: null },
        {
          new: true,
          runValidators: true,
        }
      );
    }

    return await this.updateByIdAndCompany(userId, companyId, { refreshTokenJti: null });
  }

  async setRefreshTokenJti(userId, jtiOrCompanyId, jti = null) {

    if (
      jti === null &&
      typeof jtiOrCompanyId === 'string' &&
      !jtiOrCompanyId.match(/^[0-9a-f]{24}$/i)
    ) {

      return await this.Model.findByIdAndUpdate(
        userId,
        { refreshTokenJti: jtiOrCompanyId },
        {
          new: true,
          runValidators: true,
        }
      );
    }

    if (jti && jtiOrCompanyId) {
      return await this.updateByIdAndCompany(userId, jtiOrCompanyId, { refreshTokenJti: jti });
    }
    throw new Error('Invalid parameters for setRefreshTokenJti');
  }

  async deleteByIdAndCompany(userId, companyId) {
    if (!companyId) {
      throw new Error('companyId is required');
    }
    return await super.deleteByIdAndCompany(userId, companyId);
  }
}
