import rateLimit from 'express-rate-limit';

const getClientIp = (req) => {
  return req.ip || req.socket?.remoteAddress || 'unknown';
};

export const globalLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 1000,
  message: 'Too many requests from this IP, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => {
    return req.path === '/health';
  },
  keyGenerator: (req) => {
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

export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: 'Too many login attempts. Please try again after 15 minutes.',
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: true,
  skipFailedRequests: false,
  keyGenerator: (req) => {
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

export const companyLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 10000,
  message: 'Company rate limit exceeded. Please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => {
    return !req.user?.companyId;
  },
  keyGenerator: (req) => {
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

export const endpointLimiter = rateLimit({
  windowMs: 5 * 60 * 1000,
  max: 100,
  message: 'Too many requests to this endpoint. Please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => {
    return !req.user?.companyId;
  },
  keyGenerator: (req) => {
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

export const writeLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 500,
  message: 'Write operation rate limit exceeded.',
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => {
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
