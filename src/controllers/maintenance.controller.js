// src/controllers/maintenance.controller.js
import MaintenanceService from '../services/maintenance.service.js';
import { success } from '../utils/response.utils.js';

const service = new MaintenanceService();

/**
 * @desc Create maintenance log
 * @route POST /api/maintenance
 */
export const createMaintenance = async (req, res, next) => {
  try {
    const log = await service.createMaintenance(req.body);
    return success(res, 'Maintenance log created successfully', { log }, 201);
  } catch (err) {
    next(err);
  }
};

/**
 * @desc Get all maintenance logs
 * @route GET /api/maintenance
 */
export const getAllMaintenance = async (req, res, next) => {
  try {
    const logs = await service.getAllMaintenance();
    return success(res, 'Maintenance logs fetched successfully', { logs });
  } catch (err) {
    next(err);
  }
};

/**
 * @desc Get single maintenance log by ID
 * @route GET /api/maintenance/:id
 */
export const getMaintenanceById = async (req, res, next) => {
  try {
    const log = await service.getMaintenanceById(req.params.id);
    return success(res, 'Maintenance log fetched successfully', { log });
  } catch (err) {
    next(err);
  }
};

/**
 * @desc Get logs by vehicle ID
 * @route GET /api/maintenance/vehicle/:vehicleId
 */
export const getLogsByVehicle = async (req, res, next) => {
  try {
    const logs = await service.getLogsByVehicle(req.params.vehicleId);
    return success(res, 'Maintenance logs for vehicle fetched successfully', { logs });
  } catch (err) {
    next(err);
  }
};

/**
 * @desc Update maintenance log
 * @route PUT /api/maintenance/:id
 */
export const updateMaintenance = async (req, res, next) => {
  try {
    const log = await service.updateMaintenance(req.params.id, req.body);
    return success(res, 'Maintenance log updated successfully', { log });
  } catch (err) {
    next(err);
  }
};

/**
 * @desc Delete maintenance log
 * @route DELETE /api/maintenance/:id
 */
export const deleteMaintenance = async (req, res, next) => {
  try {
    const log = await service.deleteMaintenance(req.params.id);
    return success(res, 'Maintenance log deleted successfully', { log });
  } catch (err) {
    next(err);
  }
};
