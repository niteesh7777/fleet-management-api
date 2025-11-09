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
   * Create new trip
   */
  async createTrip(data) {
    // Prevent assigning vehicles that are already in trip
    if (data.vehicleIds?.length) {
      for (const vehicleId of data.vehicleIds) {
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
    const trip = await tripRepo.create(data);

    // Update vehicle & driver status to “in-trip”
    for (const vehicleId of data.vehicleIds || []) {
      await vehicleRepo.update(vehicleId, { status: 'in-trip', currentTripId: trip._id });
    }

    for (const driverId of data.driverIds || []) {
      await driverRepo.update(driverId, { status: 'on-trip', activeTripId: trip._id });
    }

    return trip;
  }

  /**
   * Get all trips
   */
  async getAllTrips(filter = {}) {
    return await tripRepo.findAll(filter);
  }

  /**
   * Get single trip by ID
   */
  async getTripById(id) {
    const trip = await tripRepo.findById(id);
    if (!trip) throw new AppError('Trip not found', 404);
    return trip;
  }

  /**
   * Update trip details
   */
  async updateTrip(id, updateData) {
    const updated = await tripRepo.update(id, updateData);
    if (!updated) throw new AppError('Trip not found', 404);
    return updated;
  }

  /**
   * Delete a trip
   */
  async deleteTrip(id) {
    const deleted = await tripRepo.delete(id);
    if (!deleted) throw new AppError('Trip not found', 404);
    return deleted;
  }

  /**
   * Add trip progress update (e.g., location/status/note)
   */
  async addProgressUpdate(id, updateData) {
    const trip = await tripRepo.findById(id);
    if (!trip) throw new AppError('Trip not found', 404);

    await trip.addProgressUpdate(updateData);
    return trip;
  }

  /**
   * Mark trip completed
   */
  async completeTrip(id) {
    const trip = await tripRepo.findById(id);
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
        status: 'inactive',
        activeTripId: null,
      });
    }

    return trip;
  }
}
