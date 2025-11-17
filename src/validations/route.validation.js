import Joi from 'joi';

const pointSchema = Joi.object({
  name: Joi.string().trim().required(),
  lat: Joi.number().required(),
  lng: Joi.number().required(),
});

export const createRouteSchema = Joi.object({
  name: Joi.string().trim().optional(),

  source: pointSchema.required().messages({
    'any.required': 'Source is required',
  }),

  destination: pointSchema.required().messages({
    'any.required': 'Destination is required',
  }),

  waypoints: Joi.array().items(
    pointSchema.keys({ stopDurationMin: Joi.number().min(0).default(0) })
  ),

  distanceKm: Joi.number().min(1).required(),
  estimatedDurationHr: Joi.number().min(0.1).required(),

  tolls: Joi.array().items(
    Joi.object({
      name: Joi.string().required(),
      cost: Joi.number().min(0).default(0),
    })
  ),

  preferredVehicleTypes: Joi.array().items(
    Joi.string().valid('Truck', 'Mini Truck', 'Trailer', 'Van', 'Other')
  ),

  createdBy: Joi.string().required(),
  isActive: Joi.boolean().default(true),
});

export const updateRouteSchema = Joi.object({
  name: Joi.string().optional(),
  source: pointSchema.optional(),
  destination: pointSchema.optional(),
  waypoints: Joi.array().items(pointSchema).optional(),
  distanceKm: Joi.number().min(1).optional(),
  estimatedDurationHr: Joi.number().min(0.1).optional(),
  tolls: Joi.array()
    .items(
      Joi.object({
        name: Joi.string(),
        cost: Joi.number().min(0),
      })
    )
    .optional(),
  preferredVehicleTypes: Joi.array()
    .items(Joi.string().valid('Truck', 'Mini Truck', 'Trailer', 'Van', 'Other'))
    .optional(),
  isActive: Joi.boolean().optional(),
});
