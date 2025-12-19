import Joi from 'joi';

export const createUserSchema = Joi.object({
  name: Joi.string().min(2).max(100).trim().required().messages({
    'string.empty': 'Name is required',
    'string.min': 'Name must be at least 2 characters long',
    'string.max': 'Name cannot exceed 100 characters',
    'any.required': 'Name is required',
  }),

  email: Joi.string().email().lowercase().trim().required().messages({
    'string.empty': 'Email is required',
    'string.email': 'Please provide a valid email address',
    'any.required': 'Email is required',
  }),

  password: Joi.string().min(8).max(128).required().messages({
    'string.empty': 'Password is required',
    'string.min': 'Password must be at least 8 characters long',
    'string.max': 'Password cannot exceed 128 characters',
    'any.required': 'Password is required',
  }),

  role: Joi.string().valid('admin', 'driver').default('driver').messages({
    'any.only': 'Role must be either admin or driver',
  }),
});

export const updateUserSchema = Joi.object({
  name: Joi.string().min(2).max(100).trim().messages({
    'string.min': 'Name must be at least 2 characters long',
    'string.max': 'Name cannot exceed 100 characters',
  }),

  email: Joi.string().email().lowercase().trim().messages({
    'string.email': 'Please provide a valid email address',
  }),

  role: Joi.string().valid('admin', 'driver').messages({
    'any.only': 'Role must be either admin or driver',
  }),
})
  .min(1)
  .messages({
    'object.min': 'At least one field must be provided for update',
  });
