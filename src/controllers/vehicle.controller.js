import VehicleService from '../services/vehicle.service.js';
import AuditService from '../services/audit.service.js';
import { success } from '../utils/response.utils.js';
import { createPaginatedResponse } from '../middlewares/pagination.middleware.js';

const service = new VehicleService();

export const createVehicle = async (req, res, next) => {
  try {
    const vehicle = await service.createVehicle(req.body);

    // Audit logging
    const creatorId = req.user?.id || req.user?._id;
    await AuditService.log({
      action: 'vehicle_creation',
      entityType: 'vehicle',
      entityId: vehicle._id,
      userId: creatorId,
      newValue: req.body,
      metadata: { createdBy: creatorId },
    });

    return success(res, 'Vehicle created successfully', { vehicle }, 201);
  } catch (err) {
    next(err);
  }
};

export const getAllVehicles = async (req, res, next) => {
  try {
    const vehicles = await service.getAllVehicles();
    return success(res, 'Vehicles fetched successfully', { vehicles });
  } catch (err) {
    next(err);
  }
};

export const getVehiclesPaginated = async (req, res, next) => {
  try {
    const { page, limit, skip } = req.pagination;
    const filter = {};

    // Add search functionality
    if (req.query.search) {
      filter.$or = [
        { vehicleNo: { $regex: req.query.search, $options: 'i' } },
        { model: { $regex: req.query.search, $options: 'i' } },
        { type: { $regex: req.query.search, $options: 'i' } },
      ];
    }

    // Add status filter
    if (req.query.status) {
      filter.status = req.query.status;
    }

    const { vehicles, total } = await service.getVehiclesPaginated(filter, { skip, limit });
    const paginatedResponse = createPaginatedResponse(vehicles, total, page, limit);

    return success(res, 'Vehicles fetched successfully', paginatedResponse);
  } catch (err) {
    next(err);
  }
};

export const getVehicleById = async (req, res, next) => {
  try {
    const vehicle = await service.getVehicleById(req.params.id);
    return success(res, 'Vehicle fetched successfully', { vehicle });
  } catch (err) {
    next(err);
  }
};

export const updateVehicle = async (req, res, next) => {
  try {
    // Get the original vehicle data for audit logging
    const originalVehicle = await service.getVehicleById(req.params.id);

    const vehicle = await service.updateVehicle(req.params.id, req.body);

    // Audit logging for status change
    const userId = req.user?.id || req.user?._id;
    if (req.body.status && originalVehicle.status !== req.body.status) {
      await AuditService.logVehicleStatusChange(
        req.params.id,
        userId,
        originalVehicle.status,
        req.body.status,
        {
          vehicleNo: vehicle.vehicleNo,
          model: vehicle.model,
        }
      );
    }

    return success(res, 'Vehicle updated successfully', { vehicle });
  } catch (err) {
    next(err);
  }
};

export const deleteVehicle = async (req, res, next) => {
  try {
    // Get vehicle data before deletion for audit logging
    const vehicleToDelete = await service.getVehicleById(req.params.id);

    const vehicle = await service.deleteVehicle(req.params.id);

    // Audit logging
    const deleterId = req.user?.id || req.user?._id;
    await AuditService.log({
      action: 'vehicle_deletion',
      entityType: 'vehicle',
      entityId: req.params.id,
      userId: deleterId,
      oldValue: {
        vehicleNo: vehicleToDelete.vehicleNo,
        model: vehicleToDelete.model,
        type: vehicleToDelete.type,
        status: vehicleToDelete.status,
      },
      metadata: { deletedBy: deleterId },
    });

    return success(res, 'Vehicle deleted successfully', { vehicle });
  } catch (err) {
    next(err);
  }
};

export const updateVehicleStatus = async (req, res, next) => {
  try {
    const { status } = req.body;

    // Get the original vehicle data for audit logging
    const originalVehicle = await service.getVehicleById(req.params.id);

    const vehicle = await service.updateStatus(req.params.id, status);

    // Audit logging for status change
    const userId = req.user?.id || req.user?._id;
    await AuditService.logVehicleStatusChange(
      req.params.id,
      userId,
      originalVehicle.status,
      status,
      {
        vehicleNo: vehicle.vehicleNo,
        model: vehicle.model,
        method: 'direct_status_update',
      }
    );

    return success(res, 'Vehicle status updated successfully', { vehicle });
  } catch (err) {
    next(err);
  }
};

export const checkInsurance = async (req, res, next) => {
  try {
    const isExpired = await service.isInsuranceExpired(req.params.id);
    return success(res, 'Insurance status checked', { isExpired });
  } catch (err) {
    next(err);
  }
};

export const assignDriver = async (req, res, next) => {
  try {
    const { vehicleId, driverId } = req.params;
    const result = await service.assignDriverToVehicle(vehicleId, driverId);

    return success(res, 'Driver assigned to vehicle successfully', result);
  } catch (err) {
    next(err);
  }
};
