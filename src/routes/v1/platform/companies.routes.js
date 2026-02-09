import express from 'express';
import { requireAuth } from '../../../middlewares/auth.middleware.js';
import { requirePlatformRole } from '../../../middlewares/role.middleware.js';

const router = express.Router();

export default router;
