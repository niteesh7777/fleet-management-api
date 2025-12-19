// src/services/client.service.js
import ClientRepository from '../repositories/client.repository.js';
import AppError from '../utils/appError.js';

const repo = new ClientRepository();

export default class ClientService {
  async createClient(data) {
    // Check for duplicate name or GST number
    const existingByName = await repo.findByName(data.name);
    if (existingByName) throw new AppError('Client name already exists', 400);

    if (data.gstNo) {
      const existingByGST = await repo.findByGST(data.gstNo);
      if (existingByGST) throw new AppError('Client with this GST already exists', 400);
    }

    const client = await repo.create(data);
    return client;
  }

  async getAllClients(filter = {}) {
    return await repo.findAll(filter);
  }

  async getClientsPaginated(filter = {}, paginationOptions = {}) {
    return await repo.findAllPaginated(filter, paginationOptions);
  }

  async getClientById(id) {
    const client = await repo.findById(id);
    if (!client) throw new AppError('Client not found', 404);
    return client;
  }

  async updateClient(id, updateData) {
    const updated = await repo.update(id, updateData);
    if (!updated) throw new AppError('Client not found', 404);
    return updated;
  }

  async deleteClient(id) {
    const deleted = await repo.delete(id);
    if (!deleted) throw new AppError('Client not found', 404);
    return deleted;
  }
}
