import AppError from '../utils/appError.js';

/**
 * Base Tenant-Aware Repository
 * All repository classes should extend this to ensure automatic tenant isolation.
 *
 * Key principles:
 * - All queries automatically include companyId filter
 * - Never trust companyId from client - always use req.user.companyId
 * - Write operations validate tenant ownership
 */
export class TenantRepository {
  constructor(Model) {
    if (!Model) {
      throw new Error('TenantRepository requires a Mongoose Model');
    }
    this.Model = Model;
  }

  /**
   * Find all documents for a company
   * @param {String} companyId - Company ObjectId
   * @param {Object} filter - Additional filters (excluding companyId)
   * @returns {Promise<Array>}
   */
  async findByCompany(companyId, filter = {}) {
    if (!companyId) {
      throw new AppError('companyId is required', 400);
    }
    return await this.Model.find({ ...filter, companyId });
  }

  /**
   * Find all documents for a company with pagination
   * @param {String} companyId - Company ObjectId
   * @param {Object} filter - Additional filters
   * @param {Object} options - { skip, limit, sort }
   * @returns {Promise<{docs: Array, total: Number}>}
   */
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

  /**
   * Find a single document by ID and verify it belongs to the company
   * @param {String} id - Document ObjectId
   * @param {String} companyId - Company ObjectId
   * @returns {Promise<Object|null>}
   */
  async findByIdAndCompany(id, companyId) {
    if (!companyId) {
      throw new AppError('companyId is required', 400);
    }
    return await this.Model.findOne({ _id: id, companyId });
  }

  /**
   * Find one document by custom criteria within a company
   * @param {String} companyId - Company ObjectId
   * @param {Object} criteria - Query criteria
   * @returns {Promise<Object|null>}
   */
  async findOneByCompany(companyId, criteria = {}) {
    if (!companyId) {
      throw new AppError('companyId is required', 400);
    }
    return await this.Model.findOne({ ...criteria, companyId });
  }

  /**
   * Create a new document for a company
   * @param {String} companyId - Company ObjectId
   * @param {Object} data - Document data (without companyId)
   * @returns {Promise<Object>}
   */
  async create(companyId, data) {
    if (!companyId) {
      throw new AppError('companyId is required', 400);
    }

    const doc = new this.Model({ ...data, companyId });
    return await doc.save();
  }

  /**
   * Update a document and verify it belongs to the company
   * @param {String} id - Document ObjectId
   * @param {String} companyId - Company ObjectId
   * @param {Object} updateData - Fields to update (cannot include companyId)
   * @returns {Promise<Object|null>}
   */
  async updateByIdAndCompany(id, companyId, updateData) {
    if (!companyId) {
      throw new AppError('companyId is required', 400);
    }

    // Prevent accidental companyId changes
    if (updateData.companyId) {
      delete updateData.companyId;
    }

    return await this.Model.findOneAndUpdate({ _id: id, companyId }, updateData, {
      new: true,
      runValidators: true,
    });
  }

  /**
   * Delete a document and verify it belongs to the company
   * @param {String} id - Document ObjectId
   * @param {String} companyId - Company ObjectId
   * @returns {Promise<Object|null>}
   */
  async deleteByIdAndCompany(id, companyId) {
    if (!companyId) {
      throw new AppError('companyId is required', 400);
    }

    return await this.Model.findOneAndDelete({ _id: id, companyId });
  }

  /**
   * Count documents for a company
   * @param {String} companyId - Company ObjectId
   * @param {Object} filter - Additional filters
   * @returns {Promise<Number>}
   */
  async countByCompany(companyId, filter = {}) {
    if (!companyId) {
      throw new AppError('companyId is required', 400);
    }

    return await this.Model.countDocuments({ ...filter, companyId });
  }

  /**
   * Aggregate data for a company
   * Ensures all aggregation pipelines include company filter
   * @param {String} companyId - Company ObjectId
   * @param {Array} pipeline - MongoDB aggregation pipeline
   * @returns {Promise<Array>}
   */
  async aggregateByCompany(companyId, pipeline = []) {
    if (!companyId) {
      throw new AppError('companyId is required', 400);
    }

    // Prepend company filter stage
    const finalPipeline = [{ $match: { companyId: companyId } }, ...pipeline];

    return await this.Model.aggregate(finalPipeline);
  }

  /**
   * Legacy method for backward compatibility (extended by specific repositories)
   * Default to findByCompany but allow override
   * @param {Object} filter - Query filter (must be created by subclass with companyId)
   * @returns {Promise<Array>}
   */
  async findAll(filter = {}) {
    // TODO: Subclasses should override this to ensure companyId is included
    if (!filter.companyId) {
      throw new AppError('findAll() must include companyId. Use findByCompany() instead.', 500);
    }
    return await this.Model.find(filter);
  }

  /**
   * Legacy method for backward compatibility
   * @param {Object} filter - Query filter (must include companyId)
   * @param {Object} options - Pagination options
   */
  async findAllPaginated(filter = {}, options = {}) {
    // TODO: Subclasses should override this to ensure companyId is included
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

  /**
   * Find by ID (no company check) - DEPRECATED
   * Use findByIdAndCompany() instead
   * @deprecated
   */
  async findById(id) {
    throw new AppError(
      'findById() is not allowed for tenant-aware repositories. Use findByIdAndCompany(id, companyId) instead.',
      500
    );
  }

  /**
   * Save a document
   * Ensure it has companyId before calling this
   * @param {Object} doc - Mongoose document
   * @returns {Promise<Object>}
   */
  async save(doc) {
    if (!doc.companyId) {
      throw new AppError('Document must have companyId before saving', 500);
    }
    return await doc.save();
  }
}

export default TenantRepository;
