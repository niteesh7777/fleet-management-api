import express from 'express';
import { validate } from '../../middlewares/validation.middleware.js';
import { pagination } from '../../middlewares/pagination.middleware.js';
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

router.post('/', validate(createClientSchema), createClient);
router.get('/', getAllClients);
router.get('/paginated', pagination({ defaultLimit: 10, maxLimit: 100 }), getClientsPaginated);
router.get('/:id', getClientById);
router.put('/:id', validate(updateClientSchema), updateClient);
router.delete('/:id', deleteClient);

export default router;
