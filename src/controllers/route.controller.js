import RouteService from '../services/route.service.js';
import { success } from '../utils/response.utils.js';
import { createPaginatedResponse } from '../middlewares/pagination.middleware.js';

const service = new RouteService();

export const createRoute = async (req, res, next) => {
  try {
    const route = await service.createRoute(req.user.companyId, req.body, req.user.id);
    return success(res, 'Route created successfully', { route }, 201);
  } catch (err) {
    next(err);
  }
};

export const getAllRoutes = async (req, res, next) => {
  try {
    const routes = await service.getAllRoutes(req.user.companyId);
    return success(res, 'Routes fetched successfully', { routes });
  } catch (err) {
    next(err);
  }
};

export const getRoutesPaginated = async (req, res, next) => {
  try {
    const { page, limit, skip } = req.pagination;
    const filter = {};

    if (req.query.search) {
      filter.$or = [
        { name: { $regex: req.query.search, $options: 'i' } },
        { 'source.city': { $regex: req.query.search, $options: 'i' } },
        { 'destination.city': { $regex: req.query.search, $options: 'i' } },
      ];
    }

    if (req.query.status) {
      filter.status = req.query.status;
    }

    const { routes, total } = await service.getRoutesPaginated(req.user.companyId, filter, {
      skip,
      limit,
    });
    const paginatedResponse = createPaginatedResponse(routes, total, page, limit);

    return success(res, 'Routes fetched successfully', paginatedResponse);
  } catch (err) {
    next(err);
  }
};

export const getRouteById = async (req, res, next) => {
  try {
    const route = await service.getRouteById(req.user.companyId, req.params.id);
    return success(res, 'Route fetched successfully', { route });
  } catch (err) {
    next(err);
  }
};

export const updateRoute = async (req, res, next) => {
  try {
    const route = await service.updateRoute(req.user.companyId, req.params.id, req.body);
    return success(res, 'Route updated successfully', { route });
  } catch (err) {
    next(err);
  }
};

export const deleteRoute = async (req, res, next) => {
  try {
    const route = await service.deleteRoute(req.user.companyId, req.params.id);
    return success(res, 'Route deleted successfully', { route });
  } catch (err) {
    next(err);
  }
};
