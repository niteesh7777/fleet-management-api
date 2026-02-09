import VehicleService from '../services/vehicle.service.js';
import AuditService from '../services/audit.service.js';
import { success } from '../utils/response.utils.js';
import { createPaginatedResponse } from '../middlewares/pagination.middleware.js';

const service = new VehicleService();

export const createVehicle = async (req, res, next) => {
  try {
    const vehicle = await service.createVehicle(req.user.companyId, req.body);

    const creatorId = req.user?.id || req.user?._id;
    await AuditService.log({
      action: 'vehicle_creation',
      entityType: 'vehicle',
      entityId: vehicle._id,
      userId: creatorId,
      companyId: req.user.companyId,
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
    const vehicles = await service.getAllVehicles(req.user.companyId);
    return success(res, 'Vehicles fetched successfully', { vehicles });
  } catch (err) {
    next(err);
  }
};

export const getVehiclesPaginated = async (req, res, next) => {
  try {
    const { page, limit, skip } = req.pagination;
    const filter = {};

    if (req.query.search) {
      filter.$or = [
        { vehicleNo: { $regex: req.query.search, $options: 'i' } },
        { model: { $regex: req.query.search, $options: 'i' } },
        { type: { $regex: req.query.search, $options: 'i' } },
      ];
    }

    if (req.query.status) {
      filter.status = req.query.status;
    }

    if (req.query.type) {
      filter.type = req.query.type;
    }

    const { vehicles, total } = await service.getVehiclesPaginated(req.user.companyId, filter, {
      skip,
      limit,
    });
    const paginatedResponse = createPaginatedResponse(vehicles, total, page, limit);

    return success(res, 'Vehicles fetched successfully', paginatedResponse);
  } catch (err) {
    next(err);
  }
};

export const getVehicleById = async (req, res, next) => {
  try {
    const vehicle = await service.getVehicleById(req.user.companyId, req.params.id);
    return success(res, 'Vehicle fetched successfully', { vehicle });
  } catch (err) {
    next(err);
  }
};

export const updateVehicle = async (req, res, next) => {
  try {

    const originalVehicle = await service.getVehicleById(req.user.companyId, req.params.id);

    const vehicle = await service.updateVehicle(req.user.companyId, req.params.id, req.body);

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

    const vehicleToDelete = await service.getVehicleById(req.user.companyId, req.params.id);

    const vehicle = await service.deleteVehicle(req.user.companyId, req.params.id);

    const deleterId = req.user?.id || req.user?._id;
    await AuditService.log({
      action: 'vehicle_deletion',
      entityType: 'vehicle',
      entityId: req.params.id,
      userId: deleterId,
      companyId: req.user.companyId,
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

    const originalVehicle = await service.getVehicleById(req.user.companyId, req.params.id);

    const vehicle = await service.updateStatus(req.user.companyId, req.params.id, status);

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
    const isExpired = await service.isInsuranceExpired(req.user.companyId, req.params.id);
    return success(res, 'Insurance status checked', { isExpired });
  } catch (err) {
    next(err);
  }
};

export const assignDriver = async (req, res, next) => {
  try {
    const { vehicleId, driverId } = req.params;
    const result = await service.assignDriverToVehicle(req.user.companyId, vehicleId, driverId);

    return success(res, 'Driver assigned to vehicle successfully', result);
  } catch (err) {
    next(err);
  }
};

export const getVehicleDependencies = async (req, res, next) => {
  try {
    const dependencies = await service.checkVehicleDependencies(req.user.companyId, req.params.id);

    return success(res, 'Dependencies checked successfully', { dependencies });
  } catch (err) {
    next(err);
  }
};

export const bulkDeleteVehicles = async (req, res, next) => {
  try {
    const { ids } = req.body;

    if (!Array.isArray(ids) || ids.length === 0) {
      throw new AppError('Vehicle IDs array is required', 400);
    }

    const results = await service.bulkDeleteVehicles(req.user.companyId, ids);

    const userId = req.user?.id || req.user?._id;
    for (const deleted of results.deleted) {
      await AuditService.log({
        action: 'vehicle_deletion',
        entityType: 'vehicle',
        entityId: deleted.id,
        userId,
        companyId: req.user.companyId,
        metadata: {
          deletedBy: userId,
          vehicleNo: deleted.vehicleNo,
          bulkOperation: true,
        },
      });
    }

    return success(res, 'Bulk delete completed', { results });
  } catch (err) {
    next(err);
  }
};
