import AppError from '../utils/appError.js';

export class TenantRepository {
  constructor(Model) {
    if (!Model) {
      throw new Error('TenantRepository requires a Mongoose Model');
    }
    this.Model = Model;
  }

  async findByCompany(companyId, filter = {}) {
    if (!companyId) {
      throw new AppError('companyId is required', 400);
    }
    return await this.Model.find({ ...filter, companyId });
  }

  async findByCompanyPaginated(companyId, filter = {}, options = {}) {
    if (!companyId) {
      throw new AppError('companyId is required', 400);
    }

    const { skip = 0, limit = 10, sort = { createdAt: -1 } } = options;
    const fullFilter = { ...filter, companyId };

    const [docs, total] = await Promise.all([
      this.Model.find(fullFilter).sort(sort).skip(skip).limit(limit),
      this.Model.countDocuments(fullFilter),
    ]);

    return { docs, total };
  }

  async findByIdAndCompany(id, companyId) {
    if (!companyId) {
      throw new AppError('companyId is required', 400);
    }
    return await this.Model.findOne({ _id: id, companyId });
  }

  async findOneByCompany(companyId, criteria = {}) {
    if (!companyId) {
      throw new AppError('companyId is required', 400);
    }
    return await this.Model.findOne({ ...criteria, companyId });
  }

  async create(companyId, data) {
    if (!companyId) {
      throw new AppError('companyId is required', 400);
    }

    const doc = new this.Model({ ...data, companyId });
    return await doc.save();
  }

  async updateByIdAndCompany(id, companyId, updateData) {
    if (!companyId) {
      throw new AppError('companyId is required', 400);
    }

    if (updateData.companyId) {
      delete updateData.companyId;
    }

    return await this.Model.findOneAndUpdate({ _id: id, companyId }, updateData, {
      new: true,
      runValidators: true,
    });
  }

  async deleteByIdAndCompany(id, companyId) {
    if (!companyId) {
      throw new AppError('companyId is required', 400);
    }

    return await this.Model.findOneAndDelete({ _id: id, companyId });
  }

  async countByCompany(companyId, filter = {}) {
    if (!companyId) {
      throw new AppError('companyId is required', 400);
    }

    return await this.Model.countDocuments({ ...filter, companyId });
  }

  async aggregateByCompany(companyId, pipeline = []) {
    if (!companyId) {
      throw new AppError('companyId is required', 400);
    }

    const finalPipeline = [{ $match: { companyId: companyId } }, ...pipeline];

    return await this.Model.aggregate(finalPipeline);
  }

  async findAll(filter = {}) {

    if (!filter.companyId) {
      throw new AppError('findAll() must include companyId. Use findByCompany() instead.', 500);
    }
    return await this.Model.find(filter);
  }

  async findAllPaginated(filter = {}, options = {}) {

    if (!filter.companyId) {
      throw new AppError(
        'findAllPaginated() must include companyId. Use findByCompanyPaginated() instead.',
        500
      );
    }

    const { skip = 0, limit = 10, sort = { createdAt: -1 } } = options;
    const [docs, total] = await Promise.all([
      this.Model.find(filter).sort(sort).skip(skip).limit(limit),
      this.Model.countDocuments(filter),
    ]);

    return { docs, total };
  }

  async findById(id) {
    throw new AppError(
      'findById() is not allowed for tenant-aware repositories. Use findByIdAndCompany(id, companyId) instead.',
      500
    );
  }

  async save(doc) {
    if (!doc.companyId) {
      throw new AppError('Document must have companyId before saving', 500);
    }
    return await doc.save();
  }
}

export default TenantRepository;
