import MaintenanceService from '../services/maintenance.service.js';
import { success } from '../utils/response.utils.js';

const service = new MaintenanceService();

export const createMaintenance = async (req, res, next) => {
  try {
    const log = await service.createMaintenance(req.body);
    return success(res, 'Maintenance log created successfully', { log }, 201);
  } catch (err) {
    next(err);
  }
};

export const getAllMaintenance = async (req, res, next) => {
  try {
    const logs = await service.getAllMaintenance();
    return success(res, 'Maintenance logs fetched successfully', { logs });
  } catch (err) {
    next(err);
  }
};

export const getMaintenanceById = async (req, res, next) => {
  try {
    const log = await service.getMaintenanceById(req.params.id);
    return success(res, 'Maintenance log fetched successfully', { log });
  } catch (err) {
    next(err);
  }
};

export const getLogsByVehicle = async (req, res, next) => {
  try {
    const logs = await service.getLogsByVehicle(req.params.vehicleId);
    return success(res, 'Maintenance logs for vehicle fetched successfully', { logs });
  } catch (err) {
    next(err);
  }
};

export const updateMaintenance = async (req, res, next) => {
  try {
    const log = await service.updateMaintenance(req.params.id, req.body);
    return success(res, 'Maintenance log updated successfully', { log });
  } catch (err) {
    next(err);
  }
};

export const deleteMaintenance = async (req, res, next) => {
  try {
    const log = await service.deleteMaintenance(req.params.id);
    return success(res, 'Maintenance log deleted successfully', { log });
  } catch (err) {
    next(err);
  }
};
