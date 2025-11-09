
import jwt from 'jsonwebtoken';
import {config} from '../config/env.js'

export function generateAccessToken(user) {
  const payload = { id: user._id, role: user.role };
  return jwt.sign(payload, config.accessTokenSecret, { expiresIn: config.accessTokenExpiresIn });
}

export function generateRefreshToken(user, opts = {}) {
  const payload = { id: user._id, jti: opts.jti };
  return jwt.sign(payload, config.refreshTokenSecrete, { expiresIn: config.refreshTokenExpiresIn });
}
