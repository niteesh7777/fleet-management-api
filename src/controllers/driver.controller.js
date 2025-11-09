// src/controllers/driver.controller.js
import DriverService from '../services/driver.service.js';
import { success } from '../utils/response.utils.js';

const service = new DriverService();

/**
 * @desc Create new driver profile
 * @route POST /api/drivers
 */
export const createDriver = async (req, res, next) => {
  try {
    const driver = await service.createDriver(req.body);
    return success(res, 'Driver created successfully', { driver }, 201);
  } catch (err) {
    next(err);
  }
};

/**
 * @desc Get all drivers
 * @route GET /api/drivers
 */
export const getAllDrivers = async (req, res, next) => {
  try {
    const drivers = await service.getAllDrivers();
    return success(res, 'Drivers fetched successfully', { drivers });
  } catch (err) {
    next(err);
  }
};

/**
 * @desc Get single driver by ID
 * @route GET /api/drivers/:id
 */
export const getDriverById = async (req, res, next) => {
  try {
    const driver = await service.getDriverById(req.params.id);
    return success(res, 'Driver fetched successfully', { driver });
  } catch (err) {
    next(err);
  }
};

/**
 * @desc Update driver info
 * @route PUT /api/drivers/:id
 */
export const updateDriver = async (req, res, next) => {
  try {
    const driver = await service.updateDriver(req.params.id, req.body);
    return success(res, 'Driver updated successfully', { driver });
  } catch (err) {
    next(err);
  }
};

/**
 * @desc Soft delete (deactivate) driver
 * @route DELETE /api/drivers/:id
 */
export const deleteDriver = async (req, res, next) => {
  try {
    const driver = await service.deleteDriver(req.params.id);
    return success(res, 'Driver deactivated successfully', { driver });
  } catch (err) {
    next(err);
  }
};
