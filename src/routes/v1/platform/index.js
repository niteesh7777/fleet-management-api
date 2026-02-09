import express from 'express';
import platformAuthRouter from './auth.routes.js';
import platformCompaniesRouter from './companies.routes.js';

const router = express.Router();

router.use('/auth', platformAuthRouter);

router.use('/companies', platformCompaniesRouter);

export default router;
