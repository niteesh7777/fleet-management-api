import DriverService from '../services/driver.service.js';
import AdminService from '../services/admin.service.js';
import { success } from '../utils/response.utils.js';
import { createPaginatedResponse } from '../middlewares/pagination.middleware.js';

const driverService = new DriverService();
const adminService = new AdminService();

export const createDriverComposite = async (req, res, next) => {
  try {
    const result = await adminService.createDriverComposite(req.body);
    return success(res, 'Driver created successfully', result, 201);
  } catch (err) {
    next(err);
  }
};

export const getAllDrivers = async (req, res, next) => {
  try {
    const drivers = await driverService.getAllDrivers(req.user.companyId);
    return success(res, 'Drivers fetched successfully', { drivers });
  } catch (err) {
    next(err);
  }
};

export const getDriversPaginated = async (req, res, next) => {
  try {
    const { page, limit, skip } = req.pagination;
    const filter = {};

    if (req.query.search) {
      filter.$or = [
        { licenseNo: { $regex: req.query.search, $options: 'i' } },
        { 'contact.phone': { $regex: req.query.search, $options: 'i' } },
      ];
    }

    if (req.query.status) {
      filter.status = req.query.status;
    }

    const { drivers, total } = await driverService.getDriversPaginated(req.user.companyId, filter, {
      skip,
      limit,
    });
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

export const updateDriverLocation = async (req, res, next) => {
  try {
    const { lat, lng } = req.body;
    console.log(`[updateDriverLocation] Request params:`, {
      driverId: req.params.id,
      lat,
      lng,
      userId: req.user?.id,
      companyId: req.user?.companyId,
    });

    const driver = await driverService.updateLocation(req.user.companyId, req.params.id, {
      lat,
      lng,
    });
    console.log('[updateDriverLocation] Location updated successfully:', driver.currentLocation);

    if (req.io) {
      const companyRoom = `company:${req.user.companyId}`;
      req.io.to(companyRoom).emit('driver:location:updated', {
        driverId: driver._id.toString(),
        companyId: req.user.companyId.toString(),
        latitude: lat,
        longitude: lng,
        accuracy: null,
        timestamp: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });
      console.log(`[Socket] Location broadcast to ${companyRoom}`);
    }

    return success(res, 'Location updated successfully', { driver });
  } catch (err) {
    console.error('[updateDriverLocation] Error:', err.message, err.stack);
    next(err);
  }
};

export const getMyProfile = async (req, res, next) => {
  try {
    const driver = await driverService.getDriverProfile(req.user.companyId, req.user.id);
    return success(res, 'Driver profile fetched successfully', { driver });
  } catch (err) {
    next(err);
  }
};

export const getDriverDependencies = async (req, res, next) => {
  try {
    const dependencies = await driverService.checkDriverDependencies(
      req.user.companyId,
      req.params.id
    );

    return success(res, 'Dependencies checked successfully', { dependencies });
  } catch (err) {
    next(err);
  }
};

export const bulkDeleteDrivers = async (req, res, next) => {
  try {
    const { ids } = req.body;

    if (!Array.isArray(ids) || ids.length === 0) {
      throw new AppError('Driver IDs array is required', 400);
    }

    const results = await driverService.bulkDeleteDrivers(req.user.companyId, ids);

    return success(res, 'Bulk delete completed', { results });
  } catch (err) {
    next(err);
  }
};
