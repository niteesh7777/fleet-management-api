/**
 * Pagination middleware for handling paginated queries
 */
const pagination = (options = {}) => {
  return (req, res, next) => {
    const { defaultLimit = 10, maxLimit = 100, defaultPage = 1 } = options;

    // Parse and validate page parameter
    let page = parseInt(req.query.page) || defaultPage;
    if (page < 1) page = defaultPage;

    // Parse and validate limit parameter
    let limit = parseInt(req.query.limit) || defaultLimit;
    if (limit < 1) limit = defaultLimit;
    if (limit > maxLimit) limit = maxLimit;

    // Calculate skip value for MongoDB
    const skip = (page - 1) * limit;

    // Add pagination data to request object
    req.pagination = {
      page,
      limit,
      skip,
      defaultLimit,
      maxLimit,
    };

    next();
  };
};

/**
 * Helper function to create paginated response
 */
const createPaginatedResponse = (data, totalItems, page, limit) => {
  const totalPages = Math.ceil(totalItems / limit);

  return {
    items: data,
    pagination: {
      total: totalItems,
      page: parseInt(page),
      limit: parseInt(limit),
      totalPages,
      hasNext: page < totalPages,
      hasPrev: page > 1,
    },
  };
};

/**
 * Helper function for MongoDB aggregation with pagination
 */
const addPaginationToAggregation = (pipeline, skip, limit) => {
  return [...pipeline, { $skip: skip }, { $limit: limit }];
};

/**
 * Helper function to get total count for aggregation
 */
const getTotalCountPipeline = (pipeline) => {
  // Remove $skip and $limit stages from pipeline for count
  const countPipeline = pipeline.filter((stage) => !stage.$skip && !stage.$limit && !stage.$sort);

  return [...countPipeline, { $count: 'total' }];
};

export { pagination, createPaginatedResponse, addPaginationToAggregation, getTotalCountPipeline };
