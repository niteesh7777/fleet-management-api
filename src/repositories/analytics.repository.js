import Trip from '../models/Trip.js';
import Vehicle from '../models/Vehicle.js';
import DriverProfile from '../models/DriverProfile.js';
import MaintenanceLog from '../models/MaintenanceLog.js';
// import Client from '../models/Client.js';

export default class AnalyticsRepository {
  async getTripStats() {
    const totalTrips = await Trip.countDocuments();
    const activeTrips = await Trip.countDocuments({
      status: { $in: ['scheduled', 'in-transit', 'started'] },
    });
    const completedTrips = await Trip.countDocuments({ status: 'completed' });
    const cancelledTrips = await Trip.countDocuments({ status: 'cancelled' });

    return { totalTrips, activeTrips, completedTrips, cancelledTrips };
  }

  async getDriverStats() {
    const totalDrivers = await DriverProfile.countDocuments();
    const activeDrivers = await DriverProfile.countDocuments({ status: 'on-trip' });
    const inactiveDrivers = await DriverProfile.countDocuments({ status: { $ne: 'on-trip' } });
    return { totalDrivers, activeDrivers, inactiveDrivers };
  }

  async getVehicleStats() {
    const totalVehicles = await Vehicle.countDocuments();
    const available = await Vehicle.countDocuments({ status: 'available' });
    const inTrip = await Vehicle.countDocuments({ status: 'in-trip' });
    const underMaintenance = await Vehicle.countDocuments({ status: 'maintenance' });
    return { totalVehicles, available, inTrip, underMaintenance };
  }

  async getRevenueStats() {
    const totalRevenue = await Trip.aggregate([
      { $group: { _id: null, total: { $sum: '$tripCost' } } },
    ]);
    const totalMaintenanceCost = await MaintenanceLog.aggregate([
      { $group: { _id: null, total: { $sum: '$cost' } } },
    ]);

    return {
      totalRevenue: totalRevenue[0]?.total || 0,
      totalMaintenanceCost: totalMaintenanceCost[0]?.total || 0,
      netProfit: (totalRevenue[0]?.total || 0) - (totalMaintenanceCost[0]?.total || 0),
    };
  }

  async getTopClients(limit = 5) {
    const topClients = await Trip.aggregate([
      { $group: { _id: '$clientId', totalTrips: { $sum: 1 }, totalSpent: { $sum: '$tripCost' } } },
      { $sort: { totalTrips: -1 } },
      { $limit: limit },
      {
        $lookup: {
          from: 'clients',
          localField: '_id',
          foreignField: '_id',
          as: 'client',
        },
      },
      { $unwind: '$client' },
      {
        $project: {
          _id: 0,
          clientId: '$client._id',
          clientName: '$client.name',
          totalTrips: 1,
          totalSpent: 1,
        },
      },
    ]);
    return topClients;
  }
}
