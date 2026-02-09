import Company from '../models/Company.js';
import AppError from '../utils/appError.js';

export default class CompanyRepository {
  constructor() {
    this.Model = Company;
  }

  async create(data) {
    if (!data.name || !data.slug || !data.ownerUserId) {
      throw new AppError('Company name, slug, and ownerUserId are required', 400);
    }

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

  async findById(companyId) {
    return await this.Model.findById(companyId).populate('ownerUserId', 'name email');
  }

  async findBySlug(slug) {
    return await this.Model.findOne({ slug }).populate('ownerUserId', 'name email');
  }

  async updateById(companyId, updateData) {

    if (updateData.slug) {
      throw new AppError('Company slug cannot be changed', 400);
    }

    return await this.Model.findByIdAndUpdate(companyId, updateData, {
      new: true,
      runValidators: true,
    }).populate('ownerUserId', 'name email');
  }

  async findByOwnerUserId(ownerUserId) {
    return await this.Model.findOne({ ownerUserId });
  }

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
