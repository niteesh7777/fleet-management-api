// src/services/auth.service.js
import argon2 from 'argon2';
import jwt from 'jsonwebtoken';
import UserRepository from '../repositories/user.repository.js';
import AppError from '../utils/appError.js';
import { generateAccessToken, generateRefreshToken } from '../utils/token.utils.js';
import { v4 as uuidv4 } from 'uuid';

const repo = new UserRepository();

export default class AuthService {
  async login({ email, password }) {
    const user = await repo.findByEmail(email);
    if (!user) throw new AppError('Invalid email or password', 400);

    const ok = await argon2.verify(user.passwordHash, password);
    if (!ok) throw new AppError('Invalid email or password', 400);

    // create jti, rotate refresh token jti
    const jti = uuidv4();
    const accessToken = generateAccessToken(user); // embed minimal claims
    const refreshToken = generateRefreshToken(user, { jti }); // token utils should accept jti

    // store jti in DB (single active session per user model)
    await repo.setRefreshTokenJti(user._id, jti);

    const safeUser = {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
    };

    return { user: safeUser, accessToken, refreshToken };
  }

  async register({ name, email, password, role }) {
    const existing = await repo.findByEmail(email);
    if (existing) throw new AppError('Email already registered', 400);

    // hash explicitly here for clarity
    const passwordHash = await argon2.hash(password);
    const user = await repo.create({ name, email, passwordHash, role });

    return {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
    };
  }

  async logout(userId) {
    await repo.clearRefreshToken(userId);
  }

  async refresh(refreshToken) {
    let payload;
    try {
      payload = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET);
    } catch (e) {
      throw new AppError('Invalid or expired refresh token', 403);
    }

    if (!payload?.id || !payload?.jti) throw new AppError('Invalid token payload', 403);

    const user = await repo.findById(payload.id);
    if (!user || !user.refreshTokenJti) throw new AppError('Session expired', 403);

    // verify jti matches
    if (user.refreshTokenJti !== payload.jti) throw new AppError('Refresh token revoked', 403);

    // rotate
    const newJti = uuidv4();
    const accessToken = generateAccessToken(user);
    const newRefreshToken = generateRefreshToken(user, { jti: newJti });

    await repo.setRefreshTokenJti(user._id, newJti);

    return { accessToken, refreshToken: newRefreshToken };
  }
}
