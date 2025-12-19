import Joi from 'joi';

export const getAuditLogsSchema = Joi.object({
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(50),
  action: Joi.string().valid(
    'driver_assignment',
    'trip_completion',
    'vehicle_status_change',
    'user_creation',
    'user_update',
    'user_deletion',
    'vehicle_creation',
    'vehicle_update',
    'vehicle_deletion',
    'trip_creation',
    'trip_update',
    'trip_deletion'
  ),
  entityType: Joi.string().valid(
    'user',
    'driver',
    'vehicle',
    'trip',
    'maintenance',
    'route',
    'client'
  ),
  entityId: Joi.string().regex(/^[0-9a-fA-F]{24}$/), // MongoDB ObjectId validation
  userId: Joi.string().regex(/^[0-9a-fA-F]{24}$/), // MongoDB ObjectId validation
  dateFrom: Joi.date().iso(),
  dateTo: Joi.date()
    .iso()
    .when('dateFrom', {
      is: Joi.exist(),
      then: Joi.date().iso().min(Joi.ref('dateFrom')),
    }),
});
