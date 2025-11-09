// src/routes/auth.routes.js
import express from 'express';
import { validate } from '../../middlewares/validation.middleware.js';
import { register, login, refresh, logout } from '../../controllers/auth.controller.js';
import { registerSchema, loginSchema } from '../../validations/auth.validation.js';

const router = express.Router();

// 🔹 Register new user
router.post('/register', validate(registerSchema), register);

// 🔹 Login existing user
router.post('/login', validate(loginSchema), login);

// 🔹 Refresh access token using refresh cookie
router.post('/refresh', refresh);

// 🔹 Logout user (clear refresh cookie, invalidate session)
router.post('/logout', logout);

export default router;
