// src/services/trip.service.js
import TripRepository from '../repositories/trip.repository.js';
import AppError from '../utils/appError.js';
import VehicleRepository from '../repositories/vehicle.repository.js';
import DriverRepository from '../repositories/driver.repository.js';

const tripRepo = new TripRepository();
const vehicleRepo = new VehicleRepository();
const driverRepo = new DriverRepository();

export default class TripService {
  /**
   * Create new trip - scoped to company
   * @param {string} companyId - Company ObjectId (from JWT)
   * @param {object} data - Trip data
   */
  async createTrip(companyId, data) {
    if (!companyId) {
      throw new AppError('companyId is required', 400);
    }

    // Prevent assigning vehicles that are already in trip
    if (data.vehicleIds?.length) {
      for (const vehicleId of data.vehicleIds) {
        // TODO: Verify vehicle belongs to companyId
        const v = await vehicleRepo.findById(vehicleId);
        if (!v) throw new AppError(`Vehicle not found: ${vehicleId}`, 404);
        if (v.status === 'in-trip') {
          throw new AppError(`Vehicle ${v.vehicleNo} is already in a trip`, 400);
        }
      }
    }

    // Prevent assigning drivers already in trip
    if (data.driverIds?.length) {
      for (const driverId of data.driverIds) {
        // TODO: Verify driver belongs to companyId
        const d = await driverRepo.findById(driverId);
        if (!d) throw new AppError(`Driver not found: ${driverId}`, 404);
        if (d.status === 'on-trip') {
          throw new AppError(`Driver ${d.licenseNo} is already assigned to a trip`, 400);
        }
      }
    }

    // Set default status
    data.status = data.status || 'scheduled';

    // Save trip
    const trip = await tripRepo.create(companyId, data);

    // Update vehicle & driver status to "in-trip"
    for (const vehicleId of data.vehicleIds || []) {
      await vehicleRepo.update(vehicleId, { status: 'in-trip', currentTripId: trip._id });
    }

    for (const driverId of data.driverIds || []) {
      await driverRepo.update(driverId, { status: 'on-trip', activeTripId: trip._id });
    }

    return trip;
  }

  /**
   * Get all trips for a company
   * @param {string} companyId - Company ObjectId (from JWT)
   * @param {object} filter - Additional filters
   */
  async getAllTrips(companyId, filter = {}) {
    if (!companyId) {
      throw new AppError('companyId is required', 400);
    }

    // Debug: Log received filter
    console.log('TripService: Processing filter:', filter);

    // Process and validate filter parameters
    const processedFilter = this.processFilterParameters(filter);
    console.log('TripService: Processed filter:', processedFilter);

    return await tripRepo.getAllByCompany(companyId, processedFilter);
  }

  /**
   * Process and validate filter parameters
   */
  processFilterParameters(filter) {
    const processedFilter = { ...filter };

    // Handle date range filters
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

    // Handle specific date filters
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

    // Validate status values against allowed enum
    if (filter.status) {
      const allowedStatuses = ['scheduled', 'started', 'in-transit', 'completed', 'cancelled'];
      if (!allowedStatuses.includes(filter.status)) {
        console.warn(
          `Invalid status value: ${filter.status}. Expected one of: ${allowedStatuses.join(', ')}`
        );
        // Don't throw error, just log warning and continue
      }
    }

    return processedFilter;
  }

  /**
   * Get paginated trips for a company
   * @param {string} companyId - Company ObjectId (from JWT)
   * @param {object} filter - Additional filters
   * @param {object} paginationOptions - Pagination options
   */
  async getTripsPaginated(companyId, filter = {}, paginationOptions = {}) {
    if (!companyId) {
      throw new AppError('companyId is required', 400);
    }
    const processedFilter = this.processFilterParameters(filter);
    return await tripRepo.getAllByCompanyPaginated(companyId, processedFilter, paginationOptions);
  }

  /**
   * Get single trip by ID - scoped to company
   * @param {string} companyId - Company ObjectId (from JWT)
   * @param {string} id - Trip ID
   */
  async getTripById(companyId, id) {
    if (!companyId) {
      throw new AppError('companyId is required', 400);
    }
    const trip = await tripRepo.getByIdAndCompany(id, companyId);
    if (!trip) throw new AppError('Trip not found', 404);
    return trip;
  }

  /**
   * Update trip details - scoped to company
   * @param {string} companyId - Company ObjectId (from JWT)
   * @param {string} id - Trip ID
   * @param {object} updateData - Update data
   */
  async updateTrip(companyId, id, updateData) {
    if (!companyId) {
      throw new AppError('companyId is required', 400);
    }

    const existingTrip = await tripRepo.getByIdAndCompany(id, companyId);
    if (!existingTrip) throw new AppError('Trip not found', 404);

    // Handle vehicle reassignment
    if (updateData.vehicleIds) {
      const oldVehicleIds = existingTrip.vehicleIds.map((v) => v.toString());
      const newVehicleIds = updateData.vehicleIds;

      // Release old vehicles no longer assigned
      const vehiclesToRelease = oldVehicleIds.filter((vId) => !newVehicleIds.includes(vId));
      for (const vehicleId of vehiclesToRelease) {
        await vehicleRepo.update(vehicleId, {
          status: 'available',
          currentTripId: null,
        });
      }

      // Assign new vehicles
      const vehiclesToAssign = newVehicleIds.filter((vId) => !oldVehicleIds.includes(vId));
      for (const vehicleId of vehiclesToAssign) {
        const v = await vehicleRepo.findById(vehicleId);
        if (!v) throw new AppError(`Vehicle not found: ${vehicleId}`, 404);
        if (v.status === 'in-trip' && v.currentTripId?.toString() !== id) {
          throw new AppError(`Vehicle ${v.vehicleNo} is already in another trip`, 400);
        }
        await vehicleRepo.update(vehicleId, {
          status: 'in-trip',
          currentTripId: id,
        });
      }
    }

    // Handle driver reassignment
    if (updateData.driverIds) {
      const oldDriverIds = existingTrip.driverIds.map((d) => d.toString());
      const newDriverIds = updateData.driverIds;

      // Release old drivers no longer assigned
      const driversToRelease = oldDriverIds.filter((dId) => !newDriverIds.includes(dId));
      for (const driverId of driversToRelease) {
        await driverRepo.update(driverId, {
          status: 'active',
          activeTripId: null,
        });
      }

      // Assign new drivers
      const driversToAssign = newDriverIds.filter((dId) => !oldDriverIds.includes(dId));
      for (const driverId of driversToAssign) {
        const d = await driverRepo.findById(driverId);
        if (!d) throw new AppError(`Driver not found: ${driverId}`, 404);
        if (d.status === 'on-trip' && d.activeTripId?.toString() !== id) {
          throw new AppError(`Driver ${d.licenseNo} is already assigned to another trip`, 400);
        }
        await driverRepo.update(driverId, {
          status: 'on-trip',
          activeTripId: id,
        });
      }
    }

    const updated = await tripRepo.update(id, updateData);
    return updated;
  }

  /**
   * Delete a trip - scoped to company
   * @param {string} companyId - Company ObjectId (from JWT)
   * @param {string} id - Trip ID
   */
  async deleteTrip(companyId, id) {
    if (!companyId) {
      throw new AppError('companyId is required', 400);
    }

    const trip = await tripRepo.getByIdAndCompany(id, companyId);
    if (!trip) throw new AppError('Trip not found', 404);

    // Release vehicles and drivers before deletion
    for (const vehicleId of trip.vehicleIds || []) {
      await vehicleRepo.update(vehicleId, {
        status: 'available',
        currentTripId: null,
      });
    }

    for (const driverId of trip.driverIds || []) {
      await driverRepo.update(driverId, {
        status: 'active',
        activeTripId: null,
      });
    }

    const deleted = await tripRepo.delete(id);
    return deleted;
  }

  /**
   * Add trip progress update - scoped to company
   * @param {string} companyId - Company ObjectId (from JWT)
   * @param {string} id - Trip ID
   * @param {object} updateData - Update data
   */
  async addProgressUpdate(companyId, id, updateData) {
    if (!companyId) {
      throw new AppError('companyId is required', 400);
    }

    const trip = await tripRepo.getByIdAndCompany(id, companyId);
    if (!trip) throw new AppError('Trip not found', 404);

    await trip.addProgressUpdate(updateData);
    return trip;
  }

  /**
   * Mark trip completed - scoped to company
   * @param {string} companyId - Company ObjectId (from JWT)
   * @param {string} id - Trip ID
   */
  async completeTrip(companyId, id) {
    if (!companyId) {
      throw new AppError('companyId is required', 400);
    }

    const trip = await tripRepo.getByIdAndCompany(id, companyId);
    if (!trip) throw new AppError('Trip not found', 404);

    await trip.markCompleted();

    // Release vehicles and drivers
    for (const vehicleId of trip.vehicleIds || []) {
      await vehicleRepo.update(vehicleId, {
        status: 'available',
        currentTripId: null,
      });
    }

    for (const driverId of trip.driverIds || []) {
      await driverRepo.update(driverId, {
        status: 'active',
        activeTripId: null,
      });
    }

    return trip;
  }

  /**
   * Get trips for driver - scoped to company
   * @param {string} companyId - Company ObjectId (from JWT)
   * @param {string} userId - User ID
   */
  async getTripsForDriver(companyId, userId) {
    if (!companyId) {
      throw new AppError('companyId is required', 400);
    }

    const profile = await driverRepo.findByUserIdAndCompany(companyId, userId);
    if (!profile) throw new AppError('Driver profile not found', 404);

    return await tripRepo.getAllByCompany(companyId, { driverIds: profile._id });
  }

  /**
   * Get available resources - scoped to company
   * @param {string} companyId - Company ObjectId (from JWT)
   */
  async getAvailableResources(companyId) {
    if (!companyId) {
      throw new AppError('companyId is required', 400);
    }

    // Get available drivers (not on trip)
    const drivers = await driverRepo.getAllByCompany(companyId, {
      status: { $in: ['active', 'inactive'] },
    });

    // Get available vehicles (not in trip)
    const vehicles = await vehicleRepo.getAllByCompany(companyId, {
      status: { $in: ['available', 'maintenance'] },
    });

    // Get all routes - import RouteRepository
    const RouteRepository = (await import('../repositories/route.repository.js')).default;
    const routeRepo = new RouteRepository();
    const routes = await routeRepo.getAllByCompany(companyId, { isActive: true });

    // Get all clients - import ClientRepository
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

  /**
   * Get all trips
   */
  async getAllTrips(filter = {}) {
    // Debug: Log received filter
    console.log('TripService: Processing filter:', filter);

    // Process and validate filter parameters
    const processedFilter = this.processFilterParameters(filter);
    console.log('TripService: Processed filter:', processedFilter);

    return await tripRepo.findAll(processedFilter);
  }

  /**
   * Process and validate filter parameters
   */
  processFilterParameters(filter) {
    const processedFilter = { ...filter };

    // Handle date range filters
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

    // Handle specific date filters
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

    // Validate status values against allowed enum
    if (filter.status) {
      const allowedStatuses = ['scheduled', 'started', 'in-transit', 'completed', 'cancelled'];
      if (!allowedStatuses.includes(filter.status)) {
        console.warn(
          `Invalid status value: ${filter.status}. Expected one of: ${allowedStatuses.join(', ')}`
        );
        // Don't throw error, just log warning and continue
      }
    }

    return processedFilter;
  }
}
