// src/controllers/driver.controller.js
import DriverService from '../services/driver.service.js';
import AdminService from '../services/admin.service.js';
import { success } from '../utils/response.utils.js';
import { createPaginatedResponse } from '../middlewares/pagination.middleware.js';

const driverService = new DriverService();
const adminService = new AdminService();

// COMPOSITE: Create User + DriverProfile
export const createDriverComposite = async (req, res, next) => {
  try {
    const result = await adminService.createDriverComposite(req.body);
    return success(res, 'Driver created successfully', result, 201);
  } catch (err) {
    next(err);
  }
};

// CRUD
export const getAllDrivers = async (req, res, next) => {
  try {
    const drivers = await driverService.getAllDrivers();
    return success(res, 'Drivers fetched successfully', { drivers });
  } catch (err) {
    next(err);
  }
};

export const getDriversPaginated = async (req, res, next) => {
  try {
    const { page, limit, skip } = req.pagination;
    const filter = {};

    // Add search functionality
    if (req.query.search) {
      filter.$or = [
        { licenseNo: { $regex: req.query.search, $options: 'i' } },
        { 'contact.phone': { $regex: req.query.search, $options: 'i' } },
      ];
    }

    // Add status filter
    if (req.query.status) {
      filter.status = req.query.status;
    }

    const { drivers, total } = await driverService.getDriversPaginated(filter, { skip, limit });
    const paginatedResponse = createPaginatedResponse(drivers, total, page, limit);

    return success(res, 'Drivers fetched successfully', paginatedResponse);
  } catch (err) {
    next(err);
  }
};

export const getDriverById = async (req, res, next) => {
  try {
    const driver = await driverService.getDriverById(req.params.id);
    return success(res, 'Driver fetched successfully', { driver });
  } catch (err) {
    next(err);
  }
};

export const updateDriver = async (req, res, next) => {
  try {
    const driver = await driverService.updateDriver(req.params.id, req.body);
    return success(res, 'Driver updated successfully', { driver });
  } catch (err) {
    next(err);
  }
};

export const deleteDriver = async (req, res, next) => {
  try {
    const driver = await driverService.deleteDriver(req.params.id);
    return success(res, 'Driver deleted successfully', { driver });
  } catch (err) {
    next(err);
  }
};

export const deactivateDriver = async (req, res, next) => {
  try {
    const driver = await driverService.deactivateDriver(req.params.id);
    return success(res, 'Driver deactivated successfully', { driver });
  } catch (err) {
    next(err);
  }
};
