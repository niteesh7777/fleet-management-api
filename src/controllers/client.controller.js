import ClientService from '../services/client.service.js';
import { success } from '../utils/response.utils.js';
import { createPaginatedResponse } from '../middlewares/pagination.middleware.js';

const service = new ClientService();

export const createClient = async (req, res, next) => {
  try {
    const client = await service.createClient({ ...req.body, companyId: req.user.companyId });
    return success(res, 'Client created successfully', { client }, 201);
  } catch (err) {
    next(err);
  }
};

export const getAllClients = async (req, res, next) => {
  try {
    const clients = await service.getAllClients(req.user.companyId);
    return success(res, 'Clients fetched successfully', { clients });
  } catch (err) {
    next(err);
  }
};

export const getClientsPaginated = async (req, res, next) => {
  try {
    const { page, limit, skip } = req.pagination;
    const filter = {};

    if (req.query.search) {
      filter.$or = [
        { name: { $regex: req.query.search, $options: 'i' } },
        { code: { $regex: req.query.search, $options: 'i' } },
        { 'contact.person': { $regex: req.query.search, $options: 'i' } },
      ];
    }

    if (req.query.status) {
      filter.status = req.query.status;
    }

    const { clients, total } = await service.getClientsPaginated(req.user.companyId, filter, {
      skip,
      limit,
    });
    const paginatedResponse = createPaginatedResponse(clients, total, page, limit);

    return success(res, 'Clients fetched successfully', paginatedResponse);
  } catch (err) {
    next(err);
  }
};

export const getClientById = async (req, res, next) => {
  try {
    const client = await service.getClientById(req.params.id, req.user.companyId);
    return success(res, 'Client fetched successfully', { client });
  } catch (err) {
    next(err);
  }
};

export const updateClient = async (req, res, next) => {
  try {
    const client = await service.updateClient(req.params.id, req.user.companyId, req.body);
    return success(res, 'Client updated successfully', { client });
  } catch (err) {
    next(err);
  }
};

export const deleteClient = async (req, res, next) => {
  try {
    const client = await service.deleteClient(req.params.id, req.user.companyId);
    return success(res, 'Client deleted successfully', { client });
  } catch (err) {
    next(err);
  }
};

export const getClientDependencies = async (req, res, next) => {
  try {
    const dependencies = await service.checkClientDependencies(req.user.companyId, req.params.id);

    return success(res, 'Dependencies checked successfully', { dependencies });
  } catch (err) {
    next(err);
  }
};

export const bulkDeleteClients = async (req, res, next) => {
  try {
    const { ids } = req.body;

    if (!Array.isArray(ids) || ids.length === 0) {
      throw new AppError('Client IDs array is required', 400);
    }

    const results = await service.bulkDeleteClients(req.user.companyId, ids);

    return success(res, 'Bulk delete completed', { results });
  } catch (err) {
    next(err);
  }
};
