import AdminService from '../services/admin.service.js';
import { success } from '../utils/response.utils.js';

const service = new AdminService();

export const createDriverComposite = async (req, res, next) => {
  try {
    const result = await service.createDriverComposite(req.body);

    return success(res, 'Driver (User + Profile) created successfully', result, 201);
  } catch (err) {
    next(err);
  }
};

export const getAllDrivers = async (req, res, next) => {
  try {
    const drivers = await service.getAllDrivers();
    return success(res, 'Drivers retrieved successfully', { drivers });
  } catch (err) {
    next(err);
  }
};
