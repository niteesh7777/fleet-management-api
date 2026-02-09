import AppError from '../utils/appError.js';

const roles = [
  {
    _id: 'admin',
    name: 'Admin',
    permissions: [
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
    ],
  },
  {
    _id: 'driver',
    name: 'Driver',
    permissions: ['read_vehicles', 'read_trips', 'read_routes', 'read_maintenance', 'read_clients'],
  },
];

export const getAllRoles = async (req, res, next) => {
  try {
    res.status(200).json({
      status: 'success',
      data: roles,
    });
  } catch (error) {
    next(error);
  }
};

export const getRoleById = async (req, res, next) => {
  try {
    const role = roles.find((r) => r._id === req.params.id);
    if (!role) {
      throw new AppError('Role not found', 404);
    }

    res.status(200).json({
      status: 'success',
      data: role,
    });
  } catch (error) {
    next(error);
  }
};

export const updateRole = async (req, res, next) => {
  try {
    const { name, permissions } = req.body;
    const roleId = req.params.id;

    const roleIndex = roles.findIndex((r) => r._id === roleId);
    if (roleIndex === -1) {
      throw new AppError('Role not found', 404);
    }

    roles[roleIndex] = {
      ...roles[roleIndex],
      name: name || roles[roleIndex].name,
      permissions: permissions || roles[roleIndex].permissions,
    };

    res.status(200).json({
      status: 'success',
      data: roles[roleIndex],
    });
  } catch (error) {
    next(error);
  }
};
