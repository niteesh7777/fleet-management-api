// src/validations/vehicle.validation.js
import Joi from 'joi';

export const createVehicleSchema = Joi.object({
  vehicleNo: Joi.string()
    .trim()
    .uppercase()
    .pattern(/^[A-Z0-9-]+$/)
    .required()
    .messages({
      'string.empty': 'Vehicle number is required',
      'string.pattern.base': 'Invalid vehicle registration format',
    }),

  model: Joi.string().trim().required().messages({
    'string.empty': 'Vehicle model is required',
  }),

  type: Joi.string().valid('Truck', 'Mini Truck', 'Trailer', 'Van', 'Other').default('Truck'),

  capacityKg: Joi.number().min(100).required().messages({
    'number.base': 'Capacity must be a number',
    'number.min': 'Vehicle capacity must be at least 100kg',
  }),

  status: Joi.string().valid('available', 'in-trip', 'maintenance').default('available'),

  insurance: Joi.object({
    policyNumber: Joi.string().allow('', null),
    expiryDate: Joi.date().optional(),
  }).optional(),

  assignedDrivers: Joi.array().items(Joi.string()).optional(),

  documents: Joi.object({
    rcBookUrl: Joi.string().uri().allow('', null),
    insuranceUrl: Joi.string().uri().allow('', null),
    pollutionCertUrl: Joi.string().uri().allow('', null),
  }).optional(),
});

export const updateVehicleSchema = Joi.object({
  model: Joi.string().trim().optional(),
  type: Joi.string().valid('Truck', 'Mini Truck', 'Trailer', 'Van', 'Other').optional(),
  capacityKg: Joi.number().min(100).optional(),
  status: Joi.string().valid('available', 'in-trip', 'maintenance').optional(),
  insurance: Joi.object({
    policyNumber: Joi.string().allow('', null),
    expiryDate: Joi.date().optional(),
  }).optional(),
  assignedDrivers: Joi.array().items(Joi.string()).optional(),
  documents: Joi.object({
    rcBookUrl: Joi.string().uri().allow('', null),
    insuranceUrl: Joi.string().uri().allow('', null),
    pollutionCertUrl: Joi.string().uri().allow('', null),
  }).optional(),
});

export const updateVehicleStatusSchema = Joi.object({
  status: Joi.string().valid('available', 'in-trip', 'maintenance').required().messages({
    'string.empty': 'Status is required',
    'any.only': 'Status must be one of available, in-trip, or maintenance',
  }),
});
