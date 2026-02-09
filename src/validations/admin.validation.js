import Joi from 'joi';

export const createDriverCompositeSchema = Joi.object({

  name: Joi.string().trim().min(2).max(100).required(),
  email: Joi.string().email().required(),
  password: Joi.string().min(6).max(100).required(),

  licenseNo: Joi.string().trim().required(),
  phone: Joi.string()
    .pattern(/^\+?[0-9]{10,14}$/)
    .required(),
  address: Joi.string().allow('', null),
  experienceYears: Joi.number().min(0).default(0),
});
