// src/services/client.service.js
import ClientRepository from '../repositories/client.repository.js';
import AppError from '../utils/appError.js';
import CompanyRepository from '../repositories/company.repository.js';
import { validateClientsLimit } from '../utils/planValidation.js';

const repo = new ClientRepository();
const companyRepo = new CompanyRepository();

export default class ClientService {
  /**
   * Create a new client with plan limit validation
   * @param {object} data - Client data including companyId
   * @throws {AppError} If plan limit exceeded or company suspended
   */
  async createClient(data) {
    // Validate plan limits before creating client
    const company = await companyRepo.findById(data.companyId);
    if (!company) {
      throw new AppError('Company not found', 404);
    }

    // Check company status and client limit
    const currentClientCount = await repo.countByCompany(data.companyId);
    validateClientsLimit(company, currentClientCount);

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

  async getAllClients(companyId, filter = {}) {
    if (!companyId) {
      throw new AppError('companyId is required', 400);
    }
    return await repo.getAllByCompany(companyId, filter);
  }

  async getClientsPaginated(companyId, filter = {}, paginationOptions = {}) {
    if (!companyId) {
      throw new AppError('companyId is required', 400);
    }
    return await repo.getAllByCompanyPaginated(companyId, filter, paginationOptions);
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
