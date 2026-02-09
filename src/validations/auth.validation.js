import Joi from 'joi';

export const registerSchema = Joi.object({
  name: Joi.string().min(2).max(100).required().messages({
    'string.empty': 'Name is required',
    'string.min': 'Name should have at least 2 characters',
  }),
  email: Joi.string().email().required().messages({
    'string.email': 'Please enter a valid email address',
  }),
  password: Joi.string().min(8).max(64).required().messages({
    'string.min': 'Password must be at least 8 characters long',
  }),
  role: Joi.string().valid('admin', 'driver').default('driver'),
});

export const loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().required(),
  companySlug: Joi.string().lowercase().required().messages({
    'string.empty': 'Company slug is required',
    'any.required': 'Company slug is required',
  }),
});

export const platformSignupSchema = Joi.object({
  companyName: Joi.string().min(2).max(100).required().messages({
    'string.empty': 'Company name is required',
    'string.min': 'Company name should have at least 2 characters',
    'string.max': 'Company name should not exceed 100 characters',
  }),
  slug: Joi.string()
    .lowercase()
    .regex(/^[a-z0-9-]+$/)
    .required()
    .messages({
      'string.empty': 'Company slug is required',
      'string.pattern.base': 'Slug must contain only lowercase letters, numbers, and hyphens',
    }),
  ownerName: Joi.string().min(2).max(100).required().messages({
    'string.empty': 'Owner name is required',
    'string.min': 'Owner name should have at least 2 characters',
  }),
  ownerEmail: Joi.string().email().required().messages({
    'string.email': 'Please enter a valid email address',
  }),
  password: Joi.string().min(8).max(64).required().messages({
    'string.min': 'Password must be at least 8 characters long',
    'string.max': 'Password should not exceed 64 characters',
  }),
});
