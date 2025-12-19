import Route from '../models/Route.js';

export default class RouteRepository {
  async create(data) {
    const route = new Route(data);
    return await route.save();
  }

  async findAll(filter = {}) {
    return await Route.find(filter)
      .populate('createdBy', 'name email role')
      .sort({ createdAt: -1 });
  }

  async findAllPaginated(filter = {}, { skip = 0, limit = 10, sort = { createdAt: -1 } } = {}) {
    const [routes, total] = await Promise.all([
      Route.find(filter)
        .populate('createdBy', 'name email role')
        .sort(sort)
        .skip(skip)
        .limit(limit),
      Route.countDocuments(filter),
    ]);

    return { routes, total };
  }

  async findById(id) {
    return await Route.findById(id).populate('createdBy', 'name email role');
  }

  async update(id, updateData) {
    return await Route.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true,
    });
  }

  async delete(id) {
    return await Route.findByIdAndDelete(id);
  }

  async findByName(name) {
    return await Route.findOne({ name });
  }
}
