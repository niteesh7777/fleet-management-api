// src/validations/driver.validation.js
import Joi from 'joi';

// Reusable phone regex
const phoneRegex = /^\+?[0-9]{10,14}$/;

export const createDriverSchema = Joi.object({
  userId: Joi.string().required().messages({
    'string.empty': 'User ID is required',
  }),

  licenseNo: Joi.string().trim().required().messages({
    'string.empty': 'License number is required',
  }),

  contact: Joi.object({
    phone: Joi.string().pattern(phoneRegex).required().messages({
      'string.pattern.base': 'Invalid phone number format',
      'string.empty': 'Phone is required',
    }),
    address: Joi.string().allow('', null),
  }).required(),

  experienceYears: Joi.number().min(0).default(0),

  assignedVehicle: Joi.string().optional(),

  status: Joi.string().valid('active', 'inactive', 'on-trip').default('inactive'),

  currentLocation: Joi.object({
    lat: Joi.number(),
    lng: Joi.number(),
    lastUpdated: Joi.date(),
  }).optional(),
});

export const updateDriverSchema = Joi.object({
  licenseNo: Joi.string().trim().optional(),
  contact: Joi.object({
    phone: Joi.string().pattern(phoneRegex).optional(),
    address: Joi.string().optional(),
  }).optional(),
  experienceYears: Joi.number().min(0).optional(),
  assignedVehicle: Joi.string().optional(),
  status: Joi.string().valid('active', 'inactive', 'on-trip').optional(),
  currentLocation: Joi.object({
    lat: Joi.number(),
    lng: Joi.number(),
    lastUpdated: Joi.date(),
  }).optional(),
});
