// src/validations/driver.validation.js
import Joi from 'joi';

export const createDriverCompositeSchema = Joi.object({
  // user creation fields
  name: Joi.string().min(2).max(100).required(),
  email: Joi.string().email().required(),
  password: Joi.string().min(6).required(),

  // driver profile fields
  licenseNo: Joi.string().required(),
  phone: Joi.string()
    .pattern(/^\+?[0-9]{10,14}$/)
    .required(),
  address: Joi.string().allow('', null),
  experienceYears: Joi.number().min(0).default(0),
});

export const updateDriverSchema = Joi.object({
  licenseNo: Joi.string().optional(),
  contact: Joi.object({
    phone: Joi.string()
      .pattern(/^\+?[0-9]{10,14}$/)
      .optional(),
    address: Joi.string().optional(),
  }),
  experienceYears: Joi.number().min(0).optional(),
  status: Joi.string().valid('active', 'inactive', 'on-trip').optional(),
});

export const updateLocationSchema = Joi.object({
  lat: Joi.number().min(-90).max(90).required(),
  lng: Joi.number().min(-180).max(180).required(),
});
