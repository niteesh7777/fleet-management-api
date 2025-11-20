import VehicleService from '../services/vehicle.service.js';
import { success } from '../utils/response.utils.js';

const service = new VehicleService();


export const createVehicle = async (req, res, next) => {
  try {
    const vehicle = await service.createVehicle(req.body);
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
    const vehicle = await service.updateVehicle(req.params.id, req.body);
    return success(res, 'Vehicle updated successfully', { vehicle });
  } catch (err) {
    next(err);
  }
};


export const deleteVehicle = async (req, res, next) => {
  try {
    const vehicle = await service.deleteVehicle(req.params.id);
    return success(res, 'Vehicle deleted successfully', { vehicle });
  } catch (err) {
    next(err);
  }
};


export const updateVehicleStatus = async (req, res, next) => {
  try {
    const { status } = req.body;
    const vehicle = await service.updateStatus(req.params.id, status);
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
