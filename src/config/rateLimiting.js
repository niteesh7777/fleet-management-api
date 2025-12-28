import rateLimit from 'express-rate-limit';
import redis from 'redis';
import { config } from './env.js';

// Helper to safely extract IP address (handles IPv6)
const getClientIp = (req) => {
  // This handles both IPv4 and IPv6 addresses properly
  return req.ip || req.socket?.remoteAddress || 'unknown';
};

/**
 * Production Rate Limiting Configuration
 *
 * Strategy:
 * - Global rate limiter (attack protection)
 * - Per-company rate limiter (fair usage)
 * - Per-endpoint rate limiters (endpoint-specific protection)
 * - All track companyId for observability
 */

// Initialize Redis client for distributed rate limiting
// Falls back to memory store if Redis unavailable (single-server deployments)
let redisClient = null;
const useRedis = config.redisUrl && config.nodeEnv === 'production';

if (useRedis) {
  try {
    redisClient = redis.createClient({
      url: config.redisUrl,
      legacyMode: false,
    });
    redisClient.on('error', (err) => {
      console.error('[RateLimit] Redis connection error:', err);
      redisClient = null; // Fallback to memory store
    });
    redisClient.connect();
    console.log('[RateLimit] Using Redis for distributed rate limiting');
  } catch (err) {
    console.warn('[RateLimit] Redis unavailable, using memory store:', err.message);
    redisClient = null;
  }
}

/**
 * GLOBAL RATE LIMITER
 * Protects against DDoS and brute force attacks
 * - 1000 requests per minute across all IPs
 * - Affects all routes
 */
export const globalLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 1000, // 1000 requests per minute
  message: 'Too many requests from this IP, please try again later.',
  standardHeaders: true, // Return rate limit info in `RateLimit-*` headers
  legacyHeaders: false, // Disable `X-RateLimit-*` headers
  skip: (req) => {
    // Skip rate limiting for health checks
    return req.path === '/health';
  },
  keyGenerator: (req) => {
    // Use IP as key (properly handles IPv6)
    return getClientIp(req);
  },
  handler: (req, res) => {
    const companyId = req.user?.companyId || 'unknown';
    console.warn('[RateLimit] Global limit exceeded', {
      ip: req.ip,
      companyId,
      path: req.path,
      method: req.method,
      timestamp: new Date().toISOString(),
    });
    res.status(429).json({
      success: false,
      message: 'Too many requests, please try again later.',
      statusCode: 429,
    });
  },
});

/**
 * AUTHENTICATION RATE LIMITER
 * Strict limits on auth endpoints to prevent brute force
 * - 10 login attempts per 15 minutes per IP
 * - Resets on successful login
 */
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // 10 attempts per window
  message: 'Too many login attempts. Please try again after 15 minutes.',
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: true, // Don't count successful requests
  skipFailedRequests: false, // Count failed requests
  keyGenerator: (req) => {
    // Use email + IP to prevent enumeration attacks (properly handles IPv6)
    const email = req.body?.email || 'unknown';
    return `${email}:${getClientIp(req)}`;
  },
  handler: (req, res) => {
    console.warn('[RateLimit] Auth limit exceeded', {
      email: req.body?.email,
      ip: req.ip,
      timestamp: new Date().toISOString(),
    });
    res.status(429).json({
      success: false,
      message: 'Too many login attempts. Please try again after 15 minutes.',
      statusCode: 429,
    });
  },
});

/**
 * PER-COMPANY RATE LIMITER
 * Fair usage limits per company to prevent one company from starving others
 * - 10,000 requests per hour per company
 * - Enforced after authentication
 */
export const companyLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 10000, // 10,000 requests per hour per company
  message: 'Company rate limit exceeded. Please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => {
    // Only apply to authenticated requests
    return !req.user?.companyId;
  },
  keyGenerator: (req) => {
    // Key by companyId (ensures fair usage per company)
    return req.user?.companyId || 'unknown';
  },
  handler: (req, res) => {
    const companyId = req.user?.companyId || 'unknown';
    console.warn('[RateLimit] Company limit exceeded', {
      companyId,
      path: req.path,
      method: req.method,
      timestamp: new Date().toISOString(),
    });
    res.status(429).json({
      success: false,
      message: 'Company rate limit exceeded. Please contact support.',
      statusCode: 429,
      companyId,
    });
  },
});

/**
 * API ENDPOINT RATE LIMITER
 * Protects expensive endpoints
 * - 100 requests per 5 minutes per company for complex operations
 */
export const endpointLimiter = rateLimit({
  windowMs: 5 * 60 * 1000, // 5 minutes
  max: 100, // 100 requests per window
  message: 'Too many requests to this endpoint. Please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => {
    // Only apply to authenticated requests
    return !req.user?.companyId;
  },
  keyGenerator: (req) => {
    // Key by companyId + endpoint
    return `${req.user?.companyId}:${req.path}`;
  },
  handler: (req, res) => {
    const companyId = req.user?.companyId || 'unknown';
    console.warn('[RateLimit] Endpoint limit exceeded', {
      companyId,
      path: req.path,
      method: req.method,
      timestamp: new Date().toISOString(),
    });
    res.status(429).json({
      success: false,
      message: 'Endpoint rate limit exceeded. Please try again later.',
      statusCode: 429,
      companyId,
    });
  },
});

/**
 * WRITE OPERATIONS LIMITER
 * Stricter limits for create/update/delete operations
 * - 500 write operations per hour per company
 */
export const writeLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 500, // 500 writes per hour
  message: 'Write operation rate limit exceeded.',
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => {
    // Only apply to authenticated write operations
    return !req.user?.companyId || !['POST', 'PUT', 'PATCH', 'DELETE'].includes(req.method);
  },
  keyGenerator: (req) => {
    return req.user?.companyId || 'unknown';
  },
  handler: (req, res) => {
    const companyId = req.user?.companyId || 'unknown';
    console.warn('[RateLimit] Write limit exceeded', {
      companyId,
      path: req.path,
      method: req.method,
      timestamp: new Date().toISOString(),
    });
    res.status(429).json({
      success: false,
      message: 'Write operation limit exceeded. Please try again later.',
      statusCode: 429,
      companyId,
    });
  },
});

export default {
  globalLimiter,
  authLimiter,
  companyLimiter,
  endpointLimiter,
  writeLimiter,
};
