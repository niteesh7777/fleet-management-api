import Joi from 'joi';

const validPermissions = [
  'read_users',
  'write_users',
  'delete_users',
  'read_vehicles',
  'write_vehicles',
  'delete_vehicles',
  'read_trips',
  'write_trips',
  'delete_trips',
  'read_routes',
  'write_routes',
  'delete_routes',
  'read_maintenance',
  'write_maintenance',
  'delete_maintenance',
  'read_clients',
  'write_clients',
  'delete_clients',
  'read_analytics',
  'admin_access',
];

export const updateRoleSchema = Joi.object({
  name: Joi.string().min(2).max(50).trim().messages({
    'string.min': 'Role name must be at least 2 characters long',
    'string.max': 'Role name cannot exceed 50 characters',
  }),

  permissions: Joi.array()
    .items(Joi.string().valid(...validPermissions))
    .messages({
      'array.includes': 'Invalid permission provided',
    }),
})
  .min(1)
  .messages({
    'object.min': 'At least one field must be provided for update',
  });
