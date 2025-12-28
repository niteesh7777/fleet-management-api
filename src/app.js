import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import router from './routes/index.js';
import errorHandler from './middlewares/error.middleware.js';
import { frontendURL } from './constants.js';
import { globalLimiter, authLimiter, companyLimiter, writeLimiter } from './config/rateLimiting.js';
import { requestLogger } from './utils/logger.js';

const app = express();

// 🔒 Security Headers with Helmet
app.use(helmet());

// 🌐 CORS Configuration
app.use(
  cors({
    origin: frontendURL,
    credentials: true,
  })
);

// ✅ Structured Request Logging - logs all requests with correlation IDs and timing
app.use(requestLogger);

// 📦 Body Parsing
app.use(express.json({ limit: '1mb' }));
app.use(cookieParser());
app.use(express.urlencoded({ extended: true, limit: '1mb' }));

// 🛡️ RATE LIMITING STRATEGY (3-tier approach)

// 1️⃣ GLOBAL RATE LIMITING - DDoS protection (1000 req/min globally)
// Applied to ALL endpoints first to prevent overwhelming the server
app.use(globalLimiter);

// 2️⃣ AUTH ENDPOINT RATE LIMITING - Brute force protection (10 attempts per 15min per IP)
// Applied specifically to authentication endpoints
app.use('/api/v1/auth/login', authLimiter);
app.use('/api/v1/auth/register', authLimiter);

// 3️⃣ COMPANY-LEVEL RATE LIMITING - Fair usage (10k req/hour per company)
// Applied to all authenticated API routes to ensure no single company monopolizes resources
app.use('/api/v1', companyLimiter);

// 4️⃣ WRITE OPERATION RATE LIMITING - Data protection (500 writes/hour per company)
// Applied to all company routes to limit mutations
app.use('/api/v1', writeLimiter);

// Make Socket.IO instance available in req object
app.use((req, res, next) => {
  req.io = req.app.get('io');
  next();
});

// 📍 Routes
app.use('/api', router);

// ❌ Error Handling Middleware - Must be last
app.use(errorHandler);

// 🏥 Health Check Endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
});

// Backward compatibility endpoint
app.get('/helth', (req, res) => {
  res.status(200).json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    message: 'Note: This endpoint is deprecated. Use /health instead.',
  });
});

export default app;
