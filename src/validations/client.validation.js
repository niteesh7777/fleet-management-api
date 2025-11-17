import Joi from 'joi';

const contactSchema = Joi.object({
  person: Joi.string().trim().required(),
  phone: Joi.string()
    .pattern(/^\+?[0-9]{10,14}$/)
    .required()
    .messages({
      'string.pattern.base': 'Invalid phone number format',
    }),
  email: Joi.string().email().optional(),
});

export const createClientSchema = Joi.object({
  name: Joi.string().trim().required(),
  type: Joi.string().valid('corporate', 'individual').default('corporate'),
  contact: contactSchema.required(),
  address: Joi.string().trim().required(),
  gstNo: Joi.string()
    .pattern(/^[0-9A-Z]{15}$/)
    .allow(null, '')
    .messages({ 'string.pattern.base': 'Invalid GST number format' }),
  notes: Joi.string().allow('', null),
  isActive: Joi.boolean().default(true),
});

export const updateClientSchema = Joi.object({
  name: Joi.string().trim().optional(),
  type: Joi.string().valid('corporate', 'individual').optional(),
  contact: contactSchema.optional(),
  address: Joi.string().optional(),
  gstNo: Joi.string()
    .pattern(/^[0-9A-Z]{15}$/)
    .allow(null, ''),
  notes: Joi.string().optional(),
  isActive: Joi.boolean().optional(),
});
