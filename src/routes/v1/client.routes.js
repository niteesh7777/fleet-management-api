// src/routes/client.routes.js
import express from 'express';
import { validate } from '../../middlewares/validation.middleware.js';
import {
  createClient,
  getAllClients,
  getClientById,
  updateClient,
  deleteClient,
} from '../../controllers/client.controller.js';
import { createClientSchema, updateClientSchema } from '../../validations/client.validation.js';

const router = express.Router();

router.post('/', validate(createClientSchema), createClient);
router.get('/', getAllClients);
router.get('/:id', getClientById);
router.put('/:id', validate(updateClientSchema), updateClient);
router.delete('/:id', deleteClient);

export default router;
