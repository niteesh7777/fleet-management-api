import express from 'express';
import { requireAuth } from '../../../middlewares/auth.middleware.js';
import { requirePlatformRole } from '../../../middlewares/role.middleware.js';
import { validate } from '../../../middlewares/validation.middleware.js';
import { platformSignup } from '../../../controllers/auth.controller.js';
import { platformSignupSchema } from '../../../validations/auth.validation.js';

const router = express.Router();

router.post('/signup', validate(platformSignupSchema), platformSignup);

export default router;
