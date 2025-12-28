import Company from '../models/Company.js';
import AppError from '../utils/appError.js';

export default class CompanyRepository {
  constructor() {
    this.Model = Company;
  }

  /**
   * Create a new company
   * @param {Object} data - Company data (name, slug, ownerUserId, plan, status)
   * @returns {Promise<Object>} Created company document
   */
  async create(data) {
    if (!data.name || !data.slug || !data.ownerUserId) {
      throw new AppError('Company name, slug, and ownerUserId are required', 400);
    }

    // Check if slug already exists
    const existing = await this.Model.findOne({ slug: data.slug });
    if (existing) {
      throw new AppError('Company slug already exists', 400);
    }

    try {
      const company = new this.Model(data);
      await company.save();
      return company;
    } catch (err) {
      if (err.code === 11000) {
        throw new AppError('Company with this slug already exists', 400);
      }
      throw err;
    }
  }

  /**
   * Find company by ID
   * @param {String} companyId - Company ObjectId
   * @returns {Promise<Object|null>}
   */
  async findById(companyId) {
    return await this.Model.findById(companyId).populate('ownerUserId', 'name email');
  }

  /**
   * Find company by slug
   * @param {String} slug - Company slug
   * @returns {Promise<Object|null>}
   */
  async findBySlug(slug) {
    return await this.Model.findOne({ slug }).populate('ownerUserId', 'name email');
  }

  /**
   * Update company
   * @param {String} companyId - Company ObjectId
   * @param {Object} updateData - Fields to update
   * @returns {Promise<Object|null>}
   */
  async updateById(companyId, updateData) {
    // Prevent slug changes via update (should be immutable)
    if (updateData.slug) {
      throw new AppError('Company slug cannot be changed', 400);
    }

    return await this.Model.findByIdAndUpdate(companyId, updateData, {
      new: true,
      runValidators: true,
    }).populate('ownerUserId', 'name email');
  }

  /**
   * Find company by owner user ID
   * @param {String} ownerUserId - User ObjectId
   * @returns {Promise<Object|null>}
   */
  async findByOwnerUserId(ownerUserId) {
    return await this.Model.findOne({ ownerUserId });
  }

  /**
   * Get all active companies
   * @param {Object} options - { skip, limit }
   * @returns {Promise<{docs: Array, total: Number}>}
   */
  async getAllActive(options = {}) {
    const skip = options.skip || 0;
    const limit = options.limit || 50;

    const [docs, total] = await Promise.all([
      this.Model.find({ status: 'active' })
        .skip(skip)
        .limit(limit)
        .populate('ownerUserId', 'name email')
        .sort({ createdAt: -1 }),
      this.Model.countDocuments({ status: 'active' }),
    ]);

    return { docs, total };
  }
}
