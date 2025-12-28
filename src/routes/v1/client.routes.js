import express from 'express';
import { validate } from '../../middlewares/validation.middleware.js';
import { pagination } from '../../middlewares/pagination.middleware.js';
import { requireRole } from '../../middlewares/role.middleware.js';
import { COMPANY_ADMIN_ROLES } from '../../constants/roleGroups.js';
import {
  createClient,
  getAllClients,
  getClientsPaginated,
  getClientById,
  updateClient,
  deleteClient,
} from '../../controllers/client.controller.js';
import { createClientSchema, updateClientSchema } from '../../validations/client.validation.js';

const router = express.Router();

router.post('/', requireRole(...COMPANY_ADMIN_ROLES), validate(createClientSchema), createClient);
router.get('/', requireRole(...COMPANY_ADMIN_ROLES), getAllClients);
router.get(
  '/paginated',
  requireRole(...COMPANY_ADMIN_ROLES),
  pagination({ defaultLimit: 10, maxLimit: 100 }),
  getClientsPaginated
);
router.get('/:id', requireRole(...COMPANY_ADMIN_ROLES), getClientById);
router.put('/:id', requireRole(...COMPANY_ADMIN_ROLES), validate(updateClientSchema), updateClient);
router.delete('/:id', requireRole(...COMPANY_ADMIN_ROLES), deleteClient);

export default router;
