// src/controllers/client.controller.js
import ClientService from '../services/client.service.js';
import { success } from '../utils/response.utils.js';
import { createPaginatedResponse } from '../middlewares/pagination.middleware.js';

const service = new ClientService();

export const createClient = async (req, res, next) => {
  try {
    const client = await service.createClient(req.body);
    return success(res, 'Client created successfully', { client }, 201);
  } catch (err) {
    next(err);
  }
};

export const getAllClients = async (req, res, next) => {
  try {
    const clients = await service.getAllClients();
    return success(res, 'Clients fetched successfully', { clients });
  } catch (err) {
    next(err);
  }
};

export const getClientsPaginated = async (req, res, next) => {
  try {
    const { page, limit, skip } = req.pagination;
    const filter = {};

    // Add search functionality
    if (req.query.search) {
      filter.$or = [
        { name: { $regex: req.query.search, $options: 'i' } },
        { code: { $regex: req.query.search, $options: 'i' } },
        { 'contact.person': { $regex: req.query.search, $options: 'i' } },
      ];
    }

    // Add status filter
    if (req.query.status) {
      filter.status = req.query.status;
    }

    const { clients, total } = await service.getClientsPaginated(filter, { skip, limit });
    const paginatedResponse = createPaginatedResponse(clients, total, page, limit);

    return success(res, 'Clients fetched successfully', paginatedResponse);
  } catch (err) {
    next(err);
  }
};

export const getClientById = async (req, res, next) => {
  try {
    const client = await service.getClientById(req.params.id);
    return success(res, 'Client fetched successfully', { client });
  } catch (err) {
    next(err);
  }
};

export const updateClient = async (req, res, next) => {
  try {
    const client = await service.updateClient(req.params.id, req.body);
    return success(res, 'Client updated successfully', { client });
  } catch (err) {
    next(err);
  }
};

export const deleteClient = async (req, res, next) => {
  try {
    const client = await service.deleteClient(req.params.id);
    return success(res, 'Client deleted successfully', { client });
  } catch (err) {
    next(err);
  }
};
