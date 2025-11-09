import express from 'express';
import authRouter from './auth.routes.js';

const router = express.Router();

router.get('/', (req, res) => {
  res.json({ message: 'v1 router is working' });
});

router.use('/auth', authRouter);

export default router;
