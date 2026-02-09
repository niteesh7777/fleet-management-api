import jwt from 'jsonwebtoken';
import { config } from '../config/env.js';

export function generateAccessToken(user) {

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

export function generateRefreshToken(user, opts = {}) {

  const payload = {
    id: user._id,
    companyId: user.companyId,
    jti: opts.jti,
  };
  return jwt.sign(payload, config.refreshTokenSecret, {
    expiresIn: config.refreshTokenExpiresIn,
  });
}
