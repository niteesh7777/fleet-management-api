// src/controllers/client.controller.js
import ClientService from '../services/client.service.js';
import { success } from '../utils/response.utils.js';

const service = new ClientService();

/**
 * @desc Create a new client
 * @route POST /api/clients
 */
export const createClient = async (req, res, next) => {
  try {
    const client = await service.createClient(req.body);
    return success(res, 'Client created successfully', { client }, 201);
  } catch (err) {
    next(err);
  }
};

/**
 * @desc Get all clients
 * @route GET /api/clients
 */
export const getAllClients = async (req, res, next) => {
  try {
    const clients = await service.getAllClients();
    return success(res, 'Clients fetched successfully', { clients });
  } catch (err) {
    next(err);
  }
};

/**
 * @desc Get single client by ID
 * @route GET /api/clients/:id
 */
export const getClientById = async (req, res, next) => {
  try {
    const client = await service.getClientById(req.params.id);
    return success(res, 'Client fetched successfully', { client });
  } catch (err) {
    next(err);
  }
};

/**
 * @desc Update client info
 * @route PUT /api/clients/:id
 */
export const updateClient = async (req, res, next) => {
  try {
    const client = await service.updateClient(req.params.id, req.body);
    return success(res, 'Client updated successfully', { client });
  } catch (err) {
    next(err);
  }
};

/**
 * @desc Delete a client
 * @route DELETE /api/clients/:id
 */
export const deleteClient = async (req, res, next) => {
  try {
    const client = await service.deleteClient(req.params.id);
    return success(res, 'Client deleted successfully', { client });
  } catch (err) {
    next(err);
  }
};
