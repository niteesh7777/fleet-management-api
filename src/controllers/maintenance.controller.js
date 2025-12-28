import MaintenanceService from '../services/maintenance.service.js';
import { success } from '../utils/response.utils.js';
import { createPaginatedResponse } from '../middlewares/pagination.middleware.js';

const service = new MaintenanceService();

export const createMaintenance = async (req, res, next) => {
  try {
    const { companyId, id: userId } = req.user;
    const log = await service.createMaintenance(companyId, userId, req.body);
    return success(res, 'Maintenance log created successfully', { log }, 201);
  } catch (err) {
    next(err);
  }
};

export const getAllMaintenance = async (req, res, next) => {
  try {
    const { companyId } = req.user;
    const logs = await service.getAllMaintenance(companyId);
    return success(res, 'Maintenance logs fetched successfully', { logs });
  } catch (err) {
    next(err);
  }
};

export const getMaintenancePaginated = async (req, res, next) => {
  try {
    const { page, limit, skip } = req.pagination;
    const { companyId } = req.user;
    const filter = {};

    // Add search functionality
    if (req.query.search) {
      filter.$or = [
        { description: { $regex: req.query.search, $options: 'i' } },
        { serviceType: { $regex: req.query.search, $options: 'i' } },
      ];
    }

    // Add status filter
    if (req.query.status) {
      filter.status = req.query.status;
    }

    // Add vehicle filter
    if (req.query.vehicleId) {
      filter.vehicleId = req.query.vehicleId;
    }

    // Add service type filter
    if (req.query.serviceType) {
      filter.serviceType = req.query.serviceType;
    }

    const { logs, total } = await service.getMaintenancePaginated(companyId, filter, {
      skip,
      limit,
    });
    const paginatedResponse = createPaginatedResponse(logs, total, page, limit);

    return success(res, 'Maintenance logs fetched successfully', paginatedResponse);
  } catch (err) {
    next(err);
  }
};

export const getMaintenanceById = async (req, res, next) => {
  try {
    const { companyId } = req.user;
    const log = await service.getMaintenanceById(req.params.id, companyId);
    return success(res, 'Maintenance log fetched successfully', { log });
  } catch (err) {
    next(err);
  }
};

export const getLogsByVehicle = async (req, res, next) => {
  try {
    const { companyId } = req.user;
    const logs = await service.getLogsByVehicle(req.params.vehicleId, companyId);
    return success(res, 'Maintenance logs for vehicle fetched successfully', { logs });
  } catch (err) {
    next(err);
  }
};

export const updateMaintenance = async (req, res, next) => {
  try {
    const { companyId } = req.user;
    const log = await service.updateMaintenance(req.params.id, companyId, req.body);
    return success(res, 'Maintenance log updated successfully', { log });
  } catch (err) {
    next(err);
  }
};

export const deleteMaintenance = async (req, res, next) => {
  try {
    const { companyId } = req.user;
    const log = await service.deleteMaintenance(req.params.id, companyId);
    return success(res, 'Maintenance log deleted successfully', { log });
  } catch (err) {
    next(err);
  }
};
