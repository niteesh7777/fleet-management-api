// src/services/route.service.js
import RouteRepository from '../repositories/route.repository.js';
import AppError from '../utils/appError.js';

const repo = new RouteRepository();

export default class RouteService {
  async createRoute(companyId, data, userId) {
    if (!companyId) {
      throw new AppError('companyId is required', 400);
    }

    // Auto-generate name if not provided
    if (!data.name && data.source?.name && data.destination?.name) {
      data.name = `${data.source.name} → ${data.destination.name}`;
    }

    if (data.name) {
      const existing = await repo.findOneByCompany(companyId, { name: data.name });
      if (existing) {
        throw new AppError('Route name already exists', 400);
      }
    }

    const route = await repo.create(companyId, {
      ...data,
      createdBy: userId || data.createdBy,
    });
    return route;
  }

  async getAllRoutes(companyId, filter = {}) {
    if (!companyId) {
      throw new AppError('companyId is required', 400);
    }
    return await repo.getAllByCompany(companyId, filter);
  }

  async getRoutesPaginated(companyId, filter = {}, paginationOptions = {}) {
    if (!companyId) {
      throw new AppError('companyId is required', 400);
    }
    return await repo.getAllByCompanyPaginated(companyId, filter, paginationOptions);
  }

  async getRouteById(companyId, id) {
    if (!companyId) {
      throw new AppError('companyId is required', 400);
    }
    const route = await repo.getByIdAndCompany(id, companyId);
    if (!route) throw new AppError('Route not found', 404);
    return route;
  }

  async updateRoute(companyId, id, updateData) {
    if (!companyId) {
      throw new AppError('companyId is required', 400);
    }

    const existingRoute = await repo.getByIdAndCompany(id, companyId);
    if (!existingRoute) throw new AppError('Route not found', 404);

    if (updateData.name && updateData.name !== existingRoute.name) {
      const duplicate = await repo.findOneByCompany(companyId, { name: updateData.name });
      if (duplicate) {
        throw new AppError('Route name already exists', 400);
      }
    }

    const updated = await repo.updateByIdAndCompany(id, companyId, updateData);
    if (!updated) throw new AppError('Route not found', 404);
    return updated;
  }

  async deleteRoute(companyId, id) {
    if (!companyId) {
      throw new AppError('companyId is required', 400);
    }
    const deleted = await repo.deleteByIdAndCompany(id, companyId);
    if (!deleted) throw new AppError('Route not found', 404);
    return deleted;
  }
}
