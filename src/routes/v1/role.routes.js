import express from 'express';
import { requireAuth } from '../../middlewares/auth.middleware.js';
import { requireRole } from '../../middlewares/role.middleware.js';
import { validate } from '../../middlewares/validation.middleware.js';
import { getAllRoles, getRoleById, updateRole } from '../../controllers/role.controller.js';
import { updateRoleSchema } from '../../validations/role.validation.js';

const router = express.Router();

// All routes require authentication and admin role
router.use(requireAuth());
router.use(requireRole('admin'));

router.get('/', getAllRoles);
router.get('/:id', getRoleById);
router.put('/:id', validate(updateRoleSchema), updateRole);

export default router;
