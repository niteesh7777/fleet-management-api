// src/controllers/vehicle.controller.js
import VehicleService from '../services/vehicle.service.js';
import { success } from '../utils/response.utils.js';

const service = new VehicleService();

/**
 * @desc Create a new vehicle
 * @route POST /api/vehicles
 */
export const createVehicle = async (req, res, next) => {
  try {
    const vehicle = await service.createVehicle(req.body);
    return success(res, 'Vehicle created successfully', { vehicle }, 201);
  } catch (err) {
    next(err);
  }
};

/**
 * @desc Get all vehicles
 * @route GET /api/vehicles
 */
export const getAllVehicles = async (req, res, next) => {
  try {
    const vehicles = await service.getAllVehicles();
    return success(res, 'Vehicles fetched successfully', { vehicles });
  } catch (err) {
    next(err);
  }
};

/**
 * @desc Get single vehicle by ID
 * @route GET /api/vehicles/:id
 */
export const getVehicleById = async (req, res, next) => {
  try {
    const vehicle = await service.getVehicleById(req.params.id);
    return success(res, 'Vehicle fetched successfully', { vehicle });
  } catch (err) {
    next(err);
  }
};

/**
 * @desc Update vehicle details
 * @route PUT /api/vehicles/:id
 */
export const updateVehicle = async (req, res, next) => {
  try {
    const vehicle = await service.updateVehicle(req.params.id, req.body);
    return success(res, 'Vehicle updated successfully', { vehicle });
  } catch (err) {
    next(err);
  }
};

/**
 * @desc Delete a vehicle
 * @route DELETE /api/vehicles/:id
 */
export const deleteVehicle = async (req, res, next) => {
  try {
    const vehicle = await service.deleteVehicle(req.params.id);
    return success(res, 'Vehicle deleted successfully', { vehicle });
  } catch (err) {
    next(err);
  }
};

/**
 * @desc Update vehicle status
 * @route PATCH /api/vehicles/:id/status
 */
export const updateVehicleStatus = async (req, res, next) => {
  try {
    const { status } = req.body;
    const vehicle = await service.updateStatus(req.params.id, status);
    return success(res, 'Vehicle status updated successfully', { vehicle });
  } catch (err) {
    next(err);
  }
};

/**
 * @desc Check if vehicle insurance is expired
 * @route GET /api/vehicles/:id/insurance
 */
export const checkInsurance = async (req, res, next) => {
  try {
    const isExpired = await service.isInsuranceExpired(req.params.id);
    return success(res, 'Insurance status checked', { isExpired });
  } catch (err) {
    next(err);
  }
};
