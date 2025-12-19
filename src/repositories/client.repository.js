import Client from '../models/Client.js';

export default class ClientRepository {
  async create(data) {
    const client = new Client(data);
    return await client.save();
  }

  async findAll(filter = {}) {
    return await Client.find(filter).populate({
      path: 'trips',
      select: 'tripCode status startTime endTime',
    });
  }

  async findAllPaginated(filter = {}, { skip = 0, limit = 10, sort = { createdAt: -1 } } = {}) {
    const [clients, total] = await Promise.all([
      Client.find(filter)
        .populate({
          path: 'trips',
          select: 'tripCode status startTime endTime',
        })
        .sort(sort)
        .skip(skip)
        .limit(limit),
      Client.countDocuments(filter),
    ]);

    return { clients, total };
  }

  async findById(id) {
    return await Client.findById(id).populate({
      path: 'trips',
      select: 'tripCode status startTime endTime',
    });
  }

  async update(id, updateData) {
    return await Client.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true,
    });
  }

  async delete(id) {
    return await Client.findByIdAndDelete(id);
  }

  async findByName(name) {
    return await Client.findOne({ name });
  }

  async findByGST(gstNo) {
    return await Client.findOne({ gstNo });
  }
}
