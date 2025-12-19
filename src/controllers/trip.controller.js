import TripService from '../services/trip.service.js';
import AuditService from '../services/audit.service.js';
import { success } from '../utils/response.utils.js';
import { createPaginatedResponse } from '../middlewares/pagination.middleware.js';

const service = new TripService();

export const createTrip = async (req, res, next) => {
  try {
    const trip = await service.createTrip(req.body);

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
    // optionally accept filters via query params (e.g., ?status=started&clientId=...)
    const filter = { ...req.query };
    const trips = await service.getAllTrips(filter);
    return success(res, 'Trips fetched successfully', { trips });
  } catch (err) {
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

    const { trips, total } = await service.getTripsPaginated(filter, { skip, limit });
    const paginatedResponse = createPaginatedResponse(trips, total, page, limit);

    return success(res, 'Trips fetched successfully', paginatedResponse);
  } catch (err) {
    return next(err);
  }
};

export const getTripById = async (req, res, next) => {
  try {
    const trip = await service.getTripById(req.params.id);
    return success(res, 'Trip fetched successfully', { trip });
  } catch (err) {
    return next(err);
  }
};

export const updateTrip = async (req, res, next) => {
  try {
    // Get the original trip data for audit logging
    const originalTrip = await service.getTripById(req.params.id);

    const trip = await service.updateTrip(req.params.id, req.body);

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
    const tripToDelete = await service.getTripById(req.params.id);

    const trip = await service.deleteTrip(req.params.id);

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
    const trip = await service.addProgressUpdate(req.params.id, updateData);
    return success(res, 'Progress update added', { trip });
  } catch (err) {
    return next(err);
  }
};

export const completeTrip = async (req, res, next) => {
  try {
    const trip = await service.completeTrip(req.params.id);
    return success(res, 'Trip completed', { trip });
  } catch (err) {
    return next(err);
  }
};

export const getMyTrips = async (req, res, next) => {
  try {
    const trips = await service.getTripsForDriver(req.user.id);
    return success(res, 'Trips fetched successfully', { trips });
  } catch (err) {
    next(err);
  }
};
