// src/controllers/route.controller.js
import RouteService from '../services/route.service.js';
import { success } from '../utils/response.utils.js';

const service = new RouteService();

export const createRoute = async (req, res, next) => {
  try {
    const route = await service.createRoute(req.body);
    return success(res, 'Route created successfully', { route }, 201);
  } catch (err) {
    next(err);
  }
};

export const getAllRoutes = async (req, res, next) => {
  try {
    const routes = await service.getAllRoutes();
    return success(res, 'Routes fetched successfully', { routes });
  } catch (err) {
    next(err);
  }
};

export const getRouteById = async (req, res, next) => {
  try {
    const route = await service.getRouteById(req.params.id);
    return success(res, 'Route fetched successfully', { route });
  } catch (err) {
    next(err);
  }
};

export const updateRoute = async (req, res, next) => {
  try {
    const route = await service.updateRoute(req.params.id, req.body);
    return success(res, 'Route updated successfully', { route });
  } catch (err) {
    next(err);
  }
};

export const deleteRoute = async (req, res, next) => {
  try {
    const route = await service.deleteRoute(req.params.id);
    return success(res, 'Route deleted successfully', { route });
  } catch (err) {
    next(err);
  }
};
