// src/controllers/analytics.controller.js
import AnalyticsService from '../services/analytics.service.js';
import { success } from '../utils/response.utils.js';

const service = new AnalyticsService();

export const getDashboardStats = async (req, res, next) => {
  try {
    const stats = await service.getDashboardStats();
    return success(res, 'Dashboard analytics fetched successfully', stats);
  } catch (err) {
    next(err);
  }
};

export const getTripSummary = async (req, res, next) => {
  try {
    const data = await service.getTripSummary();
    return success(res, 'Trip summary fetched', data);
  } catch (err) {
    next(err);
  }
};

export const getVehicleSummary = async (req, res, next) => {
  try {
    const data = await service.getVehicleSummary();
    return success(res, 'Vehicle summary fetched', data);
  } catch (err) {
    next(err);
  }
};

export const getDriverSummary = async (req, res, next) => {
  try {
    const data = await service.getDriverSummary();
    return success(res, 'Driver summary fetched', data);
  } catch (err) {
    next(err);
  }
};

export const getFinancialSummary = async (req, res, next) => {
  try {
    const data = await service.getFinancialSummary();
    return success(res, 'Financial summary fetched', data);
  } catch (err) {
    next(err);
  }
};

export const getTopClients = async (req, res, next) => {
  try {
    const limit = parseInt(req.query.limit) || 5;
    const data = await service.getTopClients(limit);
    return success(res, 'Top clients fetched', data);
  } catch (err) {
    next(err);
  }
};
