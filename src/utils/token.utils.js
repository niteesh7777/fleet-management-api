import jwt from 'jsonwebtoken';
import { config } from '../config/env.js';

// Generate short-lived Access Token
export function generateAccessToken(user) {
  // TODO: Ensure user object includes companyId, companyRole, platformRole
  // This will be enforced at the service layer
  const payload = {
    id: user._id,
    email: user.email,
    companyId: user.companyId,
    platformRole: user.platformRole,
    companyRole: user.companyRole,
  };
  return jwt.sign(payload, config.accessTokenSecret, {
    expiresIn: config.accessTokenExpiresIn,
  });
}

// Generate long-lived Refresh Token
export function generateRefreshToken(user, opts = {}) {
  // TODO: Ensure user object includes companyId
  const payload = {
    id: user._id,
    companyId: user.companyId,
    jti: opts.jti,
  };
  return jwt.sign(payload, config.refreshTokenSecret, {
    expiresIn: config.refreshTokenExpiresIn,
  });
}
