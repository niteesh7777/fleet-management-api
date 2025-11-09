// src/services/analytics.service.js
import AnalyticsRepository from '../repositories/analytics.repository.js';

const repo = new AnalyticsRepository();

export default class AnalyticsService {
  async getDashboardStats() {
    const [tripStats, driverStats, vehicleStats, revenueStats, topClients] = await Promise.all([
      repo.getTripStats(),
      repo.getDriverStats(),
      repo.getVehicleStats(),
      repo.getRevenueStats(),
      repo.getTopClients(5),
    ]);

    return {
      tripStats,
      driverStats,
      vehicleStats,
      revenueStats,
      topClients,
    };
  }

  async getTripSummary() {
    return await repo.getTripStats();
  }

  async getVehicleSummary() {
    return await repo.getVehicleStats();
  }

  async getDriverSummary() {
    return await repo.getDriverStats();
  }

  async getFinancialSummary() {
    return await repo.getRevenueStats();
  }

  async getTopClients(limit = 5) {
    return await repo.getTopClients(limit);
  }
}
