// src/services/route.service.js
import RouteRepository from '../repositories/route.repository.js';
import AppError from '../utils/appError.js';

const repo = new RouteRepository();

export default class RouteService {
  async createRoute(data) {
    // Prevent duplicate name
    const existing = await repo.findByName(data.name);
    if (existing) throw new AppError('Route name already exists', 400);

    // Auto-generate name if not provided
    if (!data.name && data.source?.name && data.destination?.name) {
      data.name = `${data.source.name} → ${data.destination.name}`;
    }

    const route = await repo.create(data);
    return route;
  }

  async getAllRoutes(filter = {}) {
    return await repo.findAll(filter);
  }

  async getRoutesPaginated(filter = {}, paginationOptions = {}) {
    return await repo.findAllPaginated(filter, paginationOptions);
  }

  async getRouteById(id) {
    const route = await repo.findById(id);
    if (!route) throw new AppError('Route not found', 404);
    return route;
  }

  async updateRoute(id, updateData) {
    const updated = await repo.update(id, updateData);
    if (!updated) throw new AppError('Route not found', 404);
    return updated;
  }

  async deleteRoute(id) {
    const deleted = await repo.delete(id);
    if (!deleted) throw new AppError('Route not found', 404);
    return deleted;
  }
}
