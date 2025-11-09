import jwt from 'jsonwebtoken';
import { config } from '../config/env.js';

// Generate short-lived Access Token (e.g., 15m)
export function generateAccessToken(user) {
  const payload = { id: user._id, role: user.role };
  return jwt.sign(payload, config.accessTokenSecret, {
    expiresIn: config.accessTokenExpiresIn,
  });
}

// Generate long-lived Refresh Token (e.g., 7d)
export function generateRefreshToken(user, opts = {}) {
  const payload = { id: user._id, jti: opts.jti };
  return jwt.sign(payload, config.refreshTokenSecret, {
    expiresIn: config.refreshTokenExpiresIn,
  });
}
