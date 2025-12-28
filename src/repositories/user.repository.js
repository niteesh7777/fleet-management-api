import User from '../models/User.js';
import { TenantRepository } from './base.repository.js';
import AppError from '../utils/appError.js';

export default class UserRepository extends TenantRepository {
  constructor() {
    super(User);
  }

  /**
   * Find user by email (legacy method for old auth flow)
   * NOTE: In multi-tenant system, email is only unique per company
   * This method searches globally (backward compatibility only)
   * @param {String} email - User email
   * @returns {Promise<Object|null>}
   * @deprecated Use findByEmailAndCompany(companyId, email) instead
   */
  async findByEmail(email) {
    // For backward compatibility with old auth flows
    // This searches across all companies - use with caution
    return await this.Model.findOne({ email }).select('+passwordHash +refreshTokenJti');
  }

  /**
   * Find user by ID (legacy method for old auth flow)
   * NOTE: This searches globally, should use findByIdAndCompany for multi-tenant safety
   * @param {String} userId - User ObjectId
   * @returns {Promise<Object|null>}
   * @deprecated Use findByIdAndCompany(userId, companyId) instead
   */
  async findById(userId) {
    // For backward compatibility with old auth flows
    return await this.Model.findById(userId).select('+passwordHash +refreshTokenJti');
  }

  /**
   * Find user by email within a company
   * @param {String} companyId - Company ObjectId
   * @param {String} email - User email
   * @returns {Promise<Object|null>}
   */
  async findByEmailAndCompany(companyId, email) {
    if (!companyId) {
      throw new Error('companyId is required');
    }
    return await this.Model.findOne({ companyId, email }).select('+passwordHash +refreshTokenJti');
  }

  /**
   * Get all users for a company
   * @param {String} companyId - Company ObjectId
   * @param {Object} filter - Additional filters
   * @returns {Promise<Array>}
   */
  async getAllByCompany(companyId, filter = {}) {
    if (!companyId) {
      throw new Error('companyId is required');
    }
    return await this.findByCompany(companyId, filter);
  }

  /**
   * Get paginated users for a company
   * @param {String} companyId - Company ObjectId
   * @param {Object} filter - Additional filters
   * @param {Object} options - { skip, limit, sort }
   * @returns {Promise<{docs: Array, total: Number}>}
   */
  async getAllByCompanyPaginated(companyId, filter = {}, options = {}) {
    if (!companyId) {
      throw new Error('companyId is required');
    }
    return await this.findByCompanyPaginated(companyId, filter, options);
  }

  /**
   * Get user by ID for a company
   * @param {String} userId - User ObjectId
   * @param {String} companyId - Company ObjectId
   * @returns {Promise<Object|null>}
   */
  async getByIdAndCompany(userId, companyId) {
    if (!companyId) {
      throw new Error('companyId is required');
    }
    return await this.findByIdAndCompany(userId, companyId);
  }

  /**
   * Create user for company
   * @param {String} companyId - Company ObjectId
   * @param {Object} data - User data (without companyId)
   * @returns {Promise<Object>}
   */
  async createForCompany(companyId, data) {
    if (!companyId) {
      throw new Error('companyId is required');
    }
    return await this.create(companyId, data);
  }

  /**
   * Update user for company
   * @param {String} userId - User ObjectId
   * @param {String} companyId - Company ObjectId
   * @param {Object} updateData - Fields to update
   * @returns {Promise<Object|null>}
   */
  async updateByIdAndCompany(userId, companyId, updateData) {
    if (!companyId) {
      throw new Error('companyId is required');
    }
    return await super.updateByIdAndCompany(userId, companyId, updateData);
  }

  /**
   * Clear refresh token for user (logout)
   * Supports both tenant-aware and legacy calls
   * @param {String} userId - User ObjectId (can be first or second param)
   * @param {String|Object} companyIdOrUndefined - Company ObjectId or undefined for legacy call
   * @returns {Promise<Object|null>}
   */
  async clearRefreshToken(userId, companyId = null) {
    // If only userId provided, use legacy method (backward compatibility)
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
    // Multi-tenant aware version
    return await this.updateByIdAndCompany(userId, companyId, { refreshTokenJti: null });
  }

  /**
   * Set refresh token JTI for user
   * Supports both tenant-aware and legacy calls
   * @param {String} userId - User ObjectId
   * @param {String} jtiOrCompanyId - JTI string OR Company ObjectId (for legacy signature)
   * @param {String} jti - JWT ID (provided only in new signature)
   * @returns {Promise<Object|null>}
   */
  async setRefreshTokenJti(userId, jtiOrCompanyId, jti = null) {
    // Legacy signature: setRefreshTokenJti(userId, jti)
    if (
      jti === null &&
      typeof jtiOrCompanyId === 'string' &&
      !jtiOrCompanyId.match(/^[0-9a-f]{24}$/i)
    ) {
      // jtiOrCompanyId looks like a JTI string (UUID), not an ObjectId
      return await this.Model.findByIdAndUpdate(
        userId,
        { refreshTokenJti: jtiOrCompanyId },
        {
          new: true,
          runValidators: true,
        }
      );
    }
    // New signature: setRefreshTokenJti(userId, companyId, jti)
    if (jti && jtiOrCompanyId) {
      return await this.updateByIdAndCompany(userId, jtiOrCompanyId, { refreshTokenJti: jti });
    }
    throw new Error('Invalid parameters for setRefreshTokenJti');
  }

  /**
   * Delete user for company
   * @param {String} userId - User ObjectId
   * @param {String} companyId - Company ObjectId
   * @returns {Promise<Object|null>}
   */
  async deleteByIdAndCompany(userId, companyId) {
    if (!companyId) {
      throw new Error('companyId is required');
    }
    return await super.deleteByIdAndCompany(userId, companyId);
  }
}
