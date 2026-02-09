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

export const aggregateDailyUsage = async () => {
  const Company = (await import('../models/Company.js')).default;
  const Trip = (await import('../models/Trip.js')).default;
  const Vehicle = (await import('../models/Vehicle.js')).default;
  const DriverProfile = (await import('../models/DriverProfile.js')).default;

  console.log('📊 Starting daily usage aggregation...');

  const companies = await Company.find({ status: 'active' });
  let processedCount = 0;

  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  yesterday.setHours(0, 0, 0, 0);

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  for (const company of companies) {
    try {

      const tripsCompleted = await Trip.countDocuments({
        companyId: company._id,
        status: 'completed',
        completedAt: { $gte: yesterday, $lt: today },
      });

      const activeVehicles = await Vehicle.countDocuments({
        companyId: company._id,
        status: { $in: ['available', 'in-trip'] },
      });

      const activeDrivers = await DriverProfile.countDocuments({
        companyId: company._id,
        status: { $in: ['available', 'on-trip'] },
      });

      const tripStats = await Trip.aggregate([
        {
          $match: {
            companyId: company._id,
            status: 'completed',
            completedAt: { $gte: yesterday, $lt: today },
          },
        },
        {
          $group: {
            _id: null,
            totalDistance: { $sum: '$estimatedDistance' },
            totalCost: { $sum: '$totalCost' },
          },
        },
      ]);

      const dailyStats = {
        date: yesterday,
        tripsCompleted,
        activeVehicles,
        activeDrivers,
        totalDistance: tripStats[0]?.totalDistance || 0,
        totalRevenue: tripStats[0]?.totalCost || 0,
      };

      console.log(`  ✓ ${company.name}:`, dailyStats);

      processedCount++;
    } catch (error) {
      console.error(`  ✗ Error processing ${company.name}:`, error.message);
    }
  }

  console.log(`✅ Aggregated usage for ${processedCount}/${companies.length} companies`);

  return {
    companiesProcessed: processedCount,
    totalCompanies: companies.length,
    date: yesterday,
  };
};
