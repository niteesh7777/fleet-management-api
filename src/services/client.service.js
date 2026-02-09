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

    // Extract companyId and create client
    const { companyId, ...clientData } = data;
    const client = await repo.create(companyId, clientData);
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

  async getClientById(id, companyId) {
    const client = await repo.findByIdAndCompany(id, companyId);
    if (!client) throw new AppError('Client not found', 404);
    return client;
  }

  async updateClient(id, companyId, updateData) {
    const client = await repo.findByIdAndCompany(id, companyId);
    if (!client) throw new AppError('Client not found', 404);

    const updated = await repo.updateByIdAndCompany(id, companyId, updateData);
    if (!updated) throw new AppError('Client not found', 404);
    return updated;
  }

  async deleteClient(id, companyId) {
    const client = await repo.findByIdAndCompany(id, companyId);
    if (!client) throw new AppError('Client not found', 404);

    const deleted = await repo.deleteByIdAndCompany(id, companyId);
    if (!deleted) throw new AppError('Client not found', 404);
    return deleted;
  }

  /**
   * Check dependencies before deleting client
   * @param {string} companyId - Company ObjectId
   * @param {string} clientId - Client ID
   * @returns {object} Dependency information
   */
  async checkClientDependencies(companyId, clientId) {
    if (!companyId) {
      throw new AppError('companyId is required', 400);
    }

    const client = await repo.findById(clientId);
    if (!client) throw new AppError('Client not found', 404);

    // Check if client belongs to company
    if (client.companyId.toString() !== companyId.toString()) {
      throw new AppError('Client not found', 404);
    }

    // Import Trip model
    const Trip = (await import('../models/Trip.js')).default;

    const activeTrips = await Trip.countDocuments({
      companyId,
      clientId,
      status: { $in: ['pending', 'started', 'in-progress', 'in-transit'] },
    });

    const totalTrips = await Trip.countDocuments({
      companyId,
      clientId,
    });

    const blockingReasons = [];
    if (activeTrips > 0) {
      blockingReasons.push(`Client has ${activeTrips} active trip(s)`);
    }

    return {
      activeTrips,
      totalTrips,
      completedTrips: totalTrips - activeTrips,
      canDelete: activeTrips === 0,
      blockingReasons,
    };
  }

  /**
   * Bulk delete clients with validation
   * @param {string} companyId - Company ObjectId
   * @param {string[]} ids - Array of client IDs
   * @returns {object} Deletion results
   */
  async bulkDeleteClients(companyId, ids) {
    if (!companyId) {
      throw new AppError('companyId is required', 400);
    }

    if (!Array.isArray(ids) || ids.length === 0) {
      throw new AppError('Client IDs array is required', 400);
    }

    const results = {
      deleted: [],
      failed: [],
      total: ids.length,
    };

    for (const id of ids) {
      try {
        const client = await repo.findById(id);
        if (!client) {
          results.failed.push({ id, reason: 'Client not found' });
          continue;
        }

        // Verify client belongs to company
        if (client.companyId.toString() !== companyId.toString()) {
          results.failed.push({ id, reason: 'Client not found' });
          continue;
        }

        // Check dependencies
        const dependencies = await this.checkClientDependencies(companyId, id);
        if (!dependencies.canDelete) {
          results.failed.push({
            id,
            name: client.name,
            reason: dependencies.blockingReasons.join(', '),
          });
          continue;
        }

        // Delete client
        await repo.delete(id);
        results.deleted.push({ id, name: client.name });
      } catch (error) {
        results.failed.push({ id, reason: error.message });
      }
    }

    return results;
  }
}
