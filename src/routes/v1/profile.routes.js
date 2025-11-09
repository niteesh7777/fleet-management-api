// src/routes/profile.routes.js
import express from 'express';
import { requireAuth } from '../../middlewares/auth.middleware.js';
import { requireRole } from '../../middlewares/role.middleware.js';
import { success } from '../../utils/response.utils.js';
import UserRepository from '../../repositories/user.repository.js';

const router = express.Router();
const repo = new UserRepository();

// ✅ For any authenticated user (driver or admin)
router.get('/me', requireAuth(), async (req, res, next) => {
  try {
    const user = await repo.findById(req.user.id);
    if (!user) return next(new Error('User not found'));

    const safeUser = {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
    };

    return success(res, 'Profile fetched successfully', { user: safeUser });
  } catch (err) {
    next(err);
  }
});

// ✅ For admin only
router.get('/admin', requireAuth(), requireRole('admin'), (req, res) => {
  return success(res, 'Welcome Admin, you have access to this route', {
    user: req.user,
  });
});

export default router;
