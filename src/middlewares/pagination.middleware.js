const pagination = (options = {}) => {
  return (req, res, next) => {
    const { defaultLimit = 10, maxLimit = 100, defaultPage = 1 } = options;

    let page = parseInt(req.query.page) || defaultPage;
    if (page < 1) page = defaultPage;

    let limit = parseInt(req.query.limit) || defaultLimit;
    if (limit < 1) limit = defaultLimit;
    if (limit > maxLimit) limit = maxLimit;

    const skip = (page - 1) * limit;

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

const addPaginationToAggregation = (pipeline, skip, limit) => {
  return [...pipeline, { $skip: skip }, { $limit: limit }];
};

const getTotalCountPipeline = (pipeline) => {

  const countPipeline = pipeline.filter((stage) => !stage.$skip && !stage.$limit && !stage.$sort);

  return [...countPipeline, { $count: 'total' }];
};

export { pagination, createPaginatedResponse, addPaginationToAggregation, getTotalCountPipeline };
