import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import router from './routes/index.js';
import errorHandler from './middlewares/error.middleware.js';
import { frontendURL } from './constants.js';
import { globalLimiter, authLimiter, companyLimiter, writeLimiter } from './config/rateLimiting.js';

const app = express();

app.use(helmet());

const allowedOrigins = ['http://localhost:5173'];

app.use(
  cors({
    origin: allowedOrigins,
    credentials: true,
  })
);

app.use(express.json({ limit: '1mb' }));
app.use(cookieParser());
app.use(express.urlencoded({ extended: true, limit: '1mb' }));

app.use(globalLimiter);

app.use('/api/v1/auth/login', authLimiter);
app.use('/api/v1/auth/register', authLimiter);

app.use('/api/v1', companyLimiter);

app.use('/api/v1', writeLimiter);

app.use((req, res, next) => {
  req.io = req.app.get('io');
  next();
});

app.use('/api', router);

app.use(errorHandler);

app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
});

app.get('/helth', (req, res) => {
  res.status(200).json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    message: 'Note: This endpoint is deprecated. Use /health instead.',
  });
});

export default app;
