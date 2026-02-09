import TripRepository from '../repositories/trip.repository.js';
import AppError from '../utils/appError.js';
import VehicleRepository from '../repositories/vehicle.repository.js';
import DriverRepository from '../repositories/driver.repository.js';

const tripRepo = new TripRepository();
const vehicleRepo = new VehicleRepository();
const driverRepo = new DriverRepository();

export default class TripService {

  async createTrip(companyId, data) {
    if (!companyId) {
      throw new AppError('companyId is required', 400);
    }

    if (data.vehicleIds?.length) {
      for (const vehicleId of data.vehicleIds) {
        const v = await vehicleRepo.findByIdAndCompany(vehicleId, companyId);
        if (!v) throw new AppError(`Vehicle not found: ${vehicleId}`, 404);
        if (v.status === 'in-trip') {
          throw new AppError(`Vehicle ${v.vehicleNo} is already in a trip`, 400);
        }
      }
    }

    if (data.driverIds?.length) {
      for (const driverId of data.driverIds) {
        const d = await driverRepo.findByIdAndCompany(driverId, companyId);
        if (!d) throw new AppError(`Driver not found: ${driverId}`, 404);
        if (d.status === 'on-trip') {
          throw new AppError(`Driver ${d.licenseNo} is already assigned to a trip`, 400);
        }
      }
    }

    data.status = data.status || 'scheduled';

    const trip = await tripRepo.create(companyId, data);

    for (const vehicleId of data.vehicleIds || []) {
      await vehicleRepo.updateByIdAndCompany(vehicleId, companyId, {
        status: 'in-trip',
        currentTripId: trip._id,
      });
    }

    for (const driverId of data.driverIds || []) {
      await driverRepo.updateByIdAndCompany(driverId, companyId, {
        status: 'on-trip',
        activeTripId: trip._id,
      });
    }

    return trip;
  }

  async getAllTrips(companyId, filter = {}) {
    if (!companyId) {
      throw new AppError('companyId is required', 400);
    }

    console.log('TripService: Processing filter:', filter);

    const processedFilter = this.processFilterParameters(filter);
    console.log('TripService: Processed filter:', processedFilter);

    return await tripRepo.getAllByCompany(companyId, processedFilter);
  }

  processFilterParameters(filter) {
    const processedFilter = { ...filter };

    if (filter.startDate || filter.endDate) {
      processedFilter.startTime = {};
      if (filter.startDate) {
        processedFilter.startTime.$gte = new Date(filter.startDate);
      }
      if (filter.endDate) {
        processedFilter.startTime.$lte = new Date(filter.endDate);
      }
      delete processedFilter.startDate;
      delete processedFilter.endDate;
    }

    if (filter.date === 'today') {
      const today = new Date();
      const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate());
      const endOfDay = new Date(
        today.getFullYear(),
        today.getMonth(),
        today.getDate(),
        23,
        59,
        59,
        999
      );

      processedFilter.startTime = {
        $gte: startOfDay,
        $lte: endOfDay,
      };
      delete processedFilter.date;
    }

    if (filter.status) {
      const allowedStatuses = ['scheduled', 'started', 'in-transit', 'completed', 'cancelled'];
      if (!allowedStatuses.includes(filter.status)) {
        console.warn(
          `Invalid status value: ${filter.status}. Expected one of: ${allowedStatuses.join(', ')}`
        );

      }
    }

    return processedFilter;
  }

  async getTripsPaginated(companyId, filter = {}, paginationOptions = {}) {
    if (!companyId) {
      throw new AppError('companyId is required', 400);
    }
    const processedFilter = this.processFilterParameters(filter);
    return await tripRepo.getAllByCompanyPaginated(companyId, processedFilter, paginationOptions);
  }

  async getTripById(companyId, id) {
    if (!companyId) {
      throw new AppError('companyId is required', 400);
    }
    const trip = await tripRepo.getByIdAndCompany(id, companyId);
    if (!trip) throw new AppError('Trip not found', 404);
    return trip;
  }

  async updateTrip(companyId, id, updateData) {
    if (!companyId) {
      throw new AppError('companyId is required', 400);
    }

    const existingTrip = await tripRepo.getByIdAndCompany(id, companyId);
    if (!existingTrip) throw new AppError('Trip not found', 404);

    if (updateData.vehicleIds) {
      const oldVehicleIds = existingTrip.vehicleIds.map((v) => v.toString());
      const newVehicleIds = updateData.vehicleIds;

      const vehiclesToRelease = oldVehicleIds.filter((vId) => !newVehicleIds.includes(vId));
      for (const vehicleId of vehiclesToRelease) {
        await vehicleRepo.updateByIdAndCompany(vehicleId, companyId, {
          status: 'available',
          currentTripId: null,
        });
      }

      const vehiclesToAssign = newVehicleIds.filter((vId) => !oldVehicleIds.includes(vId));
      for (const vehicleId of vehiclesToAssign) {
        const v = await vehicleRepo.findByIdAndCompany(vehicleId, companyId);
        if (!v) throw new AppError(`Vehicle not found: ${vehicleId}`, 404);
        if (v.status === 'in-trip' && v.currentTripId?.toString() !== id) {
          throw new AppError(`Vehicle ${v.vehicleNo} is already in another trip`, 400);
        }
        await vehicleRepo.updateByIdAndCompany(vehicleId, companyId, {
          status: 'in-trip',
          currentTripId: id,
        });
      }
    }

    if (updateData.driverIds) {
      const oldDriverIds = existingTrip.driverIds.map((d) => d.toString());
      const newDriverIds = updateData.driverIds;

      const driversToRelease = oldDriverIds.filter((dId) => !newDriverIds.includes(dId));
      for (const driverId of driversToRelease) {
        await driverRepo.updateByIdAndCompany(driverId, companyId, {
          status: 'active',
          activeTripId: null,
        });
      }

      const driversToAssign = newDriverIds.filter((dId) => !oldDriverIds.includes(dId));
      for (const driverId of driversToAssign) {
        const d = await driverRepo.findByIdAndCompany(driverId, companyId);
        if (!d) throw new AppError(`Driver not found: ${driverId}`, 404);
        if (d.status === 'on-trip' && d.activeTripId?.toString() !== id) {
          throw new AppError(`Driver ${d.licenseNo} is already assigned to another trip`, 400);
        }
        await driverRepo.updateByIdAndCompany(driverId, companyId, {
          status: 'on-trip',
          activeTripId: id,
        });
      }
    }

    const updated = await tripRepo.update(id, updateData);
    return updated;
  }

  async deleteTrip(companyId, id) {
    if (!companyId) {
      throw new AppError('companyId is required', 400);
    }

    const trip = await tripRepo.getByIdAndCompany(id, companyId);
    if (!trip) throw new AppError('Trip not found', 404);

    for (const vehicleId of trip.vehicleIds || []) {
      await vehicleRepo.updateByIdAndCompany(vehicleId, companyId, {
        status: 'available',
        currentTripId: null,
      });
    }

    for (const driverId of trip.driverIds || []) {
      await driverRepo.updateByIdAndCompany(driverId, companyId, {
        status: 'active',
        activeTripId: null,
      });
    }

    const deleted = await tripRepo.delete(id);
    return deleted;
  }

  async addProgressUpdate(companyId, id, updateData) {
    if (!companyId) {
      throw new AppError('companyId is required', 400);
    }

    const trip = await tripRepo.getByIdAndCompany(id, companyId);
    if (!trip) throw new AppError('Trip not found', 404);

    await trip.addProgressUpdate(updateData);
    return trip;
  }

  async completeTrip(companyId, id) {
    if (!companyId) {
      throw new AppError('companyId is required', 400);
    }

    const trip = await tripRepo.getByIdAndCompany(id, companyId);
    if (!trip) throw new AppError('Trip not found', 404);

    await trip.markCompleted();

    for (const vehicleId of trip.vehicleIds || []) {
      await vehicleRepo.updateByIdAndCompany(vehicleId, companyId, {
        status: 'available',
        currentTripId: null,
      });
    }

    for (const driverId of trip.driverIds || []) {
      await driverRepo.updateByIdAndCompany(driverId, companyId, {
        status: 'active',
        activeTripId: null,
      });
    }

    return trip;
  }

  async getTripsForDriver(companyId, userId) {
    if (!companyId) {
      throw new AppError('companyId is required', 400);
    }

    const profile = await driverRepo.findByUserIdAndCompany(companyId, userId);
    if (!profile) throw new AppError('Driver profile not found', 404);

    return await tripRepo.getAllByCompany(companyId, { driverIds: profile._id });
  }

  async getAvailableResources(companyId) {
    if (!companyId) {
      throw new AppError('companyId is required', 400);
    }

    const drivers = await driverRepo.getAllByCompany(companyId, {
      status: { $in: ['active', 'inactive'] },
    });

    const vehicles = await vehicleRepo.getAllByCompany(companyId, {
      status: { $in: ['available', 'maintenance'] },
    });

    const RouteRepository = (await import('../repositories/route.repository.js')).default;
    const routeRepo = new RouteRepository();
    const routes = await routeRepo.getAllByCompany(companyId, { isActive: true });

    const ClientRepository = (await import('../repositories/client.repository.js')).default;
    const clientRepo = new ClientRepository();
    const clients = await clientRepo.getAllByCompany(companyId);

    return {
      drivers: drivers.map((d) => ({
        _id: d._id,
        name: d.user?.name,
        email: d.user?.email,
        licenseNo: d.licenseNo,
        status: d.status,
        currentLocation: d.currentLocation,
        experienceYears: d.experienceYears,
      })),
      vehicles: vehicles.map((v) => ({
        _id: v._id,
        vehicleNo: v.vehicleNo,
        model: v.model,
        type: v.type,
        capacityKg: v.capacityKg,
        status: v.status,
      })),
      routes: routes.map((r) => ({
        _id: r._id,
        name: r.name,
        source: r.source,
        destination: r.destination,
        waypoints: r.waypoints,
        distanceKm: r.distanceKm,
        estimatedDurationHr: r.estimatedDurationHr,
        tolls: r.tolls,
        preferredVehicleTypes: r.preferredVehicleTypes,
      })),
      clients: clients.map((c) => ({
        _id: c._id,
        name: c.name,
        type: c.type,
        email: c.contact?.email,
      })),
    };
  }

  async getAllTrips(filter = {}) {

    console.log('TripService: Processing filter:', filter);

    const processedFilter = this.processFilterParameters(filter);
    console.log('TripService: Processed filter:', processedFilter);

    return await tripRepo.findAll(processedFilter);
  }

  processFilterParameters(filter) {
    const processedFilter = { ...filter };

    if (filter.startDate || filter.endDate) {
      processedFilter.startTime = {};
      if (filter.startDate) {
        processedFilter.startTime.$gte = new Date(filter.startDate);
      }
      if (filter.endDate) {
        processedFilter.startTime.$lte = new Date(filter.endDate);
      }
      delete processedFilter.startDate;
      delete processedFilter.endDate;
    }

    if (filter.date === 'today') {
      const today = new Date();
      const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate());
      const endOfDay = new Date(
        today.getFullYear(),
        today.getMonth(),
        today.getDate(),
        23,
        59,
        59,
        999
      );

      processedFilter.startTime = {
        $gte: startOfDay,
        $lte: endOfDay,
      };
      delete processedFilter.date;
    }

    if (filter.status) {
      const allowedStatuses = ['scheduled', 'started', 'in-transit', 'completed', 'cancelled'];
      if (!allowedStatuses.includes(filter.status)) {
        console.warn(
          `Invalid status value: ${filter.status}. Expected one of: ${allowedStatuses.join(', ')}`
        );

      }
    }

    return processedFilter;
  }

  async checkTripDependencies(companyId, tripId) {
    if (!companyId) {
      throw new AppError('companyId is required', 400);
    }

    const trip = await tripRepo.getByIdAndCompany(tripId, companyId);
    if (!trip) throw new AppError('Trip not found', 404);

    const blockingReasons = [];
    const isActive = ['started', 'in-progress', 'in-transit'].includes(trip.status);

    if (isActive) {
      blockingReasons.push(`Trip is currently ${trip.status}`);
    }

    return {
      status: trip.status,
      isActive,
      vehicleCount: trip.vehicleIds?.length || 0,
      driverCount: trip.driverIds?.length || 0,
      canDelete: !isActive,
      blockingReasons,
    };
  }

  async bulkDeleteTrips(companyId, ids) {
    if (!companyId) {
      throw new AppError('companyId is required', 400);
    }

    if (!Array.isArray(ids) || ids.length === 0) {
      throw new AppError('Trip IDs array is required', 400);
    }

    const results = {
      deleted: [],
      failed: [],
      total: ids.length,
    };

    for (const id of ids) {
      try {
        const trip = await tripRepo.getByIdAndCompany(id, companyId);
        if (!trip) {
          results.failed.push({ id, reason: 'Trip not found' });
          continue;
        }

        const dependencies = await this.checkTripDependencies(companyId, id);
        if (!dependencies.canDelete) {
          results.failed.push({
            id,
            tripCode: trip.tripCode,
            reason: dependencies.blockingReasons.join(', '),
          });
          continue;
        }

        await this.deleteTrip(companyId, id);
        results.deleted.push({ id, tripCode: trip.tripCode });
      } catch (error) {
        results.failed.push({ id, reason: error.message });
      }
    }

    return results;
  }
}
