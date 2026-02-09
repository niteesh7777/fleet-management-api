import express from 'express';
import { requireAuth } from '../../middlewares/auth.middleware.js';
import { requireRole } from '../../middlewares/role.middleware.js';
import { validate } from '../../middlewares/validation.middleware.js';
import {
  getAllUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
  toggleUserStatus,
} from '../../controllers/user.controller.js';
import { createUserSchema, updateUserSchema } from '../../validations/user.validation.js';
import { OWNER_ADMIN_ROLES } from '../../constants/roleGroups.js';

const router = express.Router();

router.use(requireAuth());
router.use(requireRole(...OWNER_ADMIN_ROLES));

router.get('/', getAllUsers);
router.get('/:id', getUserById);
router.post('/', validate(createUserSchema), createUser);
router.put('/:id', validate(updateUserSchema), updateUser);
router.delete('/:id', deleteUser);
router.patch('/:id/toggle-status', toggleUserStatus);

export default router;
