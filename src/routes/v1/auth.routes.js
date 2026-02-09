import express from 'express';
import { validate } from '../../middlewares/validation.middleware.js';
import { requireAuth } from '../../middlewares/auth.middleware.js';
import { requireCompanyRole } from '../../middlewares/role.middleware.js';
import { register, login, refresh, logout } from '../../controllers/auth.controller.js';
import { registerSchema, loginSchema } from '../../validations/auth.validation.js';

const router = express.Router();

router.post('/register', validate(registerSchema), register);

router.post('/login', validate(loginSchema), login);

router.post('/refresh', refresh);

router.post('/logout', requireAuth(), logout);

export default router;
