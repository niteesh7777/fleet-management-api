import Joi from 'joi';

export const createMaintenanceSchema = Joi.object({
  vehicleId: Joi.string().required(),
  serviceType: Joi.string()
    .valid(
      'oil-change',
      'engine-check',
      'tire-replacement',
      'brake-service',
      'accident-repair',
      'general-service',
      'pollution-check',
      'insurance-renewal',
      'other'
    )
    .default('general-service'),
  description: Joi.string().trim().required(),
  serviceDate: Joi.date().default(() => new Date()),
  cost: Joi.number().min(0).required(),
  nextDueDate: Joi.date().allow(null),
  odometerReadingKm: Joi.number().min(0).optional(),
  vendor: Joi.object({
    name: Joi.string().optional(),
    contact: Joi.string().optional(),
    address: Joi.string().optional(),
  }).optional(),
  attachments: Joi.array()
    .items(
      Joi.object({
        url: Joi.string().uri().optional(),
        fileType: Joi.string().optional(),
      })
    )
    .optional(),
  createdBy: Joi.string().required(),
  remarks: Joi.string().allow('', null),
});

export const updateMaintenanceSchema = Joi.object({
  serviceType: Joi.string().optional(),
  description: Joi.string().optional(),
  serviceDate: Joi.date().optional(),
  cost: Joi.number().min(0).optional(),
  nextDueDate: Joi.date().optional(),
  odometerReadingKm: Joi.number().min(0).optional(),
  vendor: Joi.object({
    name: Joi.string().optional(),
    contact: Joi.string().optional(),
    address: Joi.string().optional(),
  }).optional(),
  attachments: Joi.array().optional(),
  remarks: Joi.string().optional(),
});
