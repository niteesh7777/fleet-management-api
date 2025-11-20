import TripService from '../services/trip.service.js';
import { success } from '../utils/response.utils.js';

const service = new TripService();

export const createTrip = async (req, res, next) => {
  try {
    const trip = await service.createTrip(req.body);
    return success(res, 'Trip created successfully', { trip }, 201);
  } catch (err) {
    return next(err);
  }
};


export const getAllTrips = async (req, res, next) => {
  try {
    // optionally accept filters via query params (e.g., ?status=started&clientId=...)
    const filter = { ...req.query };
    const trips = await service.getAllTrips(filter);
    return success(res, 'Trips fetched successfully', { trips });
  } catch (err) {
    return next(err);
  }
};


export const getTripById = async (req, res, next) => {
  try {
    const trip = await service.getTripById(req.params.id);
    return success(res, 'Trip fetched successfully', { trip });
  } catch (err) {
    return next(err);
  }
};


export const updateTrip = async (req, res, next) => {
  try {
    const trip = await service.updateTrip(req.params.id, req.body);
    return success(res, 'Trip updated successfully', { trip });
  } catch (err) {
    return next(err);
  }
};



export const deleteTrip = async (req, res, next) => {
  try {
    const trip = await service.deleteTrip(req.params.id);
    return success(res, 'Trip deleted successfully', { trip });
  } catch (err) {
    return next(err);
  }
};


export const addProgressUpdate = async (req, res, next) => {
  try {
    const updateData = req.body;
    const trip = await service.addProgressUpdate(req.params.id, updateData);
    return success(res, 'Progress update added', { trip });
  } catch (err) {
    return next(err);
  }
};


export const completeTrip = async (req, res, next) => {
  try {
    const trip = await service.completeTrip(req.params.id);
    return success(res, 'Trip completed', { trip });
  } catch (err) {
    return next(err);
  }
};

export const getMyTrips = async (req, res, next) => {
  try {
    const trips = await service.getTripsForDriver(req.user.id);
    return success(res, 'Trips fetched successfully', { trips });
  } catch (err) {
    next(err);
  }
};
