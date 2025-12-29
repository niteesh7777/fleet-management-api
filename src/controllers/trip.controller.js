import TripService from '../services/trip.service.js';
import AuditService from '../services/audit.service.js';
import { success } from '../utils/response.utils.js';
import { createPaginatedResponse } from '../middlewares/pagination.middleware.js';

const service = new TripService();

export const createTrip = async (req, res, next) => {
  try {
    const trip = await service.createTrip(req.user.companyId, req.body);

    // Audit logging
    const creatorId = req.user?.id || req.user?._id;
    await AuditService.log({
      action: 'trip_creation',
      entityType: 'trip',
      entityId: trip._id,
      userId: creatorId,
      newValue: req.body,
      metadata: { createdBy: creatorId, tripCode: trip.tripCode },
    });

    return success(res, 'Trip created successfully', { trip }, 201);
  } catch (err) {
    return next(err);
  }
};

export const getAllTrips = async (req, res, next) => {
  try {
    // Debug: Log received query parameters
    console.log('getAllTrips: Received query parameters:', req.query);

    // optionally accept filters via query params (e.g., ?status=started&clientId=...)
    const filter = { ...req.query };
    console.log('getAllTrips: Processing filter:', filter);

    const trips = await service.getAllTrips(req.user.companyId, filter);
    console.log('getAllTrips: Found trips:', trips.length);

    return success(res, 'Trips fetched successfully', { trips });
  } catch (err) {
    console.error('getAllTrips error:', err);
    return next(err);
  }
};

export const getTripsPaginated = async (req, res, next) => {
  try {
    const { page, limit, skip } = req.pagination;
    const filter = {};

    // Add search functionality
    if (req.query.search) {
      filter.$or = [{ tripCode: { $regex: req.query.search, $options: 'i' } }];
    }

    // Add status filter
    if (req.query.status) {
      filter.status = req.query.status;
    }

    // Add client filter
    if (req.query.clientId) {
      filter.clientId = req.query.clientId;
    }

    // Add route filter
    if (req.query.routeId) {
      filter.routeId = req.query.routeId;
    }

    // Add date range filter (startDate and endDate for trip creation/start time)
    if (req.query.startDate || req.query.endDate) {
      filter.startTime = {};
      if (req.query.startDate) {
        filter.startTime.$gte = new Date(req.query.startDate);
      }
      if (req.query.endDate) {
        filter.startTime.$lte = new Date(req.query.endDate);
      }
      // If no startTime fields were added, delete the filter
      if (Object.keys(filter.startTime).length === 0) {
        delete filter.startTime;
      }
    }

    const { trips, total } = await service.getTripsPaginated(req.user.companyId, filter, {
      skip,
      limit,
    });
    const paginatedResponse = createPaginatedResponse(trips, total, page, limit);

    return success(res, 'Trips fetched successfully', paginatedResponse);
  } catch (err) {
    return next(err);
  }
};

export const getTripById = async (req, res, next) => {
  try {
    const trip = await service.getTripById(req.user.companyId, req.params.id);
    return success(res, 'Trip fetched successfully', { trip });
  } catch (err) {
    return next(err);
  }
};

export const updateTrip = async (req, res, next) => {
  try {
    // Get the original trip data for audit logging
    const originalTrip = await service.getTripById(req.user.companyId, req.params.id);

    const trip = await service.updateTrip(req.user.companyId, req.params.id, req.body);

    // Audit logging for specific actions
    const userId = req.user?.id || req.user?._id;

    // Log driver assignment
    if (
      req.body.driverId &&
      (!originalTrip.driverId || originalTrip.driverId.toString() !== req.body.driverId)
    ) {
      await AuditService.logDriverAssignment(req.body.driverId, req.params.id, userId, {
        tripCode: trip.tripCode,
        previousDriverId: originalTrip.driverId,
      });
    }

    // Log trip completion
    if (req.body.status === 'completed' && originalTrip.status !== 'completed') {
      await AuditService.logTripCompletion(
        req.params.id,
        userId,
        { status: originalTrip.status },
        { status: 'completed' },
        {
          tripCode: trip.tripCode,
          driverId: trip.driverId,
          completionTime: new Date(),
        }
      );
    }

    return success(res, 'Trip updated successfully', { trip });
  } catch (err) {
    return next(err);
  }
};

export const deleteTrip = async (req, res, next) => {
  try {
    // Get trip data before deletion for audit logging
    const tripToDelete = await service.getTripById(req.user.companyId, req.params.id);

    const trip = await service.deleteTrip(req.user.companyId, req.params.id);

    // Audit logging
    const deleterId = req.user?.id || req.user?._id;
    await AuditService.log({
      action: 'trip_deletion',
      entityType: 'trip',
      entityId: req.params.id,
      userId: deleterId,
      oldValue: {
        tripCode: tripToDelete.tripCode,
        status: tripToDelete.status,
        driverId: tripToDelete.driverId,
      },
      metadata: { deletedBy: deleterId },
    });

    return success(res, 'Trip deleted successfully', { trip });
  } catch (err) {
    return next(err);
  }
};

export const addProgressUpdate = async (req, res, next) => {
  try {
    const updateData = req.body;
    const trip = await service.addProgressUpdate(req.user.companyId, req.params.id, updateData);
    return success(res, 'Progress update added', { trip });
  } catch (err) {
    return next(err);
  }
};

export const completeTrip = async (req, res, next) => {
  try {
    const trip = await service.completeTrip(req.user.companyId, req.params.id);
    return success(res, 'Trip completed', { trip });
  } catch (err) {
    return next(err);
  }
};

export const getMyTrips = async (req, res, next) => {
  try {
    const trips = await service.getTripsForDriver(req.user.companyId, req.user.id);
    return success(res, 'Trips fetched successfully', { trips });
  } catch (err) {
    next(err);
  }
};

export const getAvailableResources = async (req, res, next) => {
  try {
    const resources = await service.getAvailableResources(req.user.companyId);
    return success(res, 'Available resources fetched successfully', resources);
  } catch (err) {
    next(err);
  }
};

export const getTripDependencies = async (req, res, next) => {
  try {
    const dependencies = await service.checkTripDependencies(req.user.companyId, req.params.id);

    return success(res, 'Dependencies checked successfully', { dependencies });
  } catch (err) {
    next(err);
  }
};

export const bulkDeleteTrips = async (req, res, next) => {
  try {
    const { ids } = req.body;

    if (!Array.isArray(ids) || ids.length === 0) {
      throw new AppError('Trip IDs array is required', 400);
    }

    const results = await service.bulkDeleteTrips(req.user.companyId, ids);

    // Audit log for each successfully deleted trip
    const userId = req.user?.id || req.user?._id;
    for (const deleted of results.deleted) {
      await AuditService.log({
        action: 'trip_bulk_deletion',
        entityType: 'trip',
        entityId: deleted.id,
        userId,
        metadata: {
          deletedBy: userId,
          tripCode: deleted.tripCode,
          bulkOperation: true,
        },
      });
    }

    return success(res, 'Bulk delete completed', { results });
  } catch (err) {
    next(err);
  }
};
