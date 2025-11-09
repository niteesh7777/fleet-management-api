// src/validations/trip.validation.js
import Joi from 'joi';

export const createTripSchema = Joi.object({
  tripCode: Joi.string()
    .trim()
    .uppercase()
    .pattern(/^[A-Z0-9_-]+$/)
    .required()
    .messages({
      'string.empty': 'Trip code is required',
      'string.pattern.base': 'Trip code can only contain letters, numbers, dashes, or underscores',
    }),

  routeId: Joi.string().required().messages({
    'string.empty': 'Route ID is required',
  }),

  vehicleIds: Joi.array().items(Joi.string()).min(1).required().messages({
    'array.min': 'At least one vehicle must be assigned',
  }),

  driverIds: Joi.array().items(Joi.string()).min(1).required().messages({
    'array.min': 'At least one driver must be assigned',
  }),

  clientId: Joi.string().required().messages({
    'string.empty': 'Client ID is required',
  }),

  goodsInfo: Joi.string().trim().required().messages({
    'string.empty': 'Goods information is required',
  }),

  loadWeightKg: Joi.number().min(0).required().messages({
    'number.base': 'Load weight must be a number',
    'number.min': 'Load weight cannot be negative',
  }),

  tripCost: Joi.number().min(0).required().messages({
    'number.base': 'Trip cost must be a number',
  }),

  startTime: Joi.date().optional(),
  endTime: Joi.date().optional(),

  status: Joi.string()
    .valid('scheduled', 'started', 'in-transit', 'completed', 'cancelled')
    .default('scheduled'),

  remarks: Joi.string().allow('', null).optional(),
});

export const updateTripSchema = Joi.object({
  routeId: Joi.string().optional(),
  vehicleIds: Joi.array().items(Joi.string()).optional(),
  driverIds: Joi.array().items(Joi.string()).optional(),
  clientId: Joi.string().optional(),
  goodsInfo: Joi.string().trim().optional(),
  loadWeightKg: Joi.number().min(0).optional(),
  tripCost: Joi.number().min(0).optional(),
  startTime: Joi.date().optional(),
  endTime: Joi.date().optional(),
  status: Joi.string()
    .valid('scheduled', 'started', 'in-transit', 'completed', 'cancelled')
    .optional(),
  remarks: Joi.string().optional(),
});

export const progressUpdateSchema = Joi.object({
  location: Joi.object({
    lat: Joi.number().required(),
    lng: Joi.number().required(),
  }).required(),

  note: Joi.string().allow('', null).optional(),

  status: Joi.string()
    .valid('started', 'in-transit', 'delayed', 'arrived', 'completed')
    .default('in-transit'),
});
