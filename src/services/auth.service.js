import argon2 from 'argon2';
import jwt from 'jsonwebtoken';
import UserRepository from '../repositories/user.repository.js';
import AppError from '../utils/appError.js';
import { generateAccessToken, generateRefreshToken } from '../utils/token.utils.js';
import { v4 as uuidv4 } from 'uuid';
import { config } from '../config/env.js';

const repo = new UserRepository();

export default class AuthService {
  async login({ email, password }) {
    console.log(`[DEBUG] Login attempt for email: ${email}`);

    const user = await repo.findByEmail(email);
    console.log(`[DEBUG] User found by email: ${!!user}`);

    if (!user) throw new AppError('Invalid email', 400);

    console.log(`[DEBUG] passwordHash exists on user: ${!!user.passwordHash}`);
    if (user.passwordHash) {
      console.log(`[DEBUG] passwordHash length: ${user.passwordHash.length}`);
      console.log(`[DEBUG] passwordHash starts with: ${user.passwordHash.substring(0, 10)}...`);
    }

    const ok = await argon2.verify(user.passwordHash, password);
    console.log(`[DEBUG] argon2.verify result: ${ok}`);

    if (!ok) throw new AppError('Invalid password', 400);

    const jti = uuidv4();
    const accessToken = generateAccessToken(user); // embed minimal claims
    const refreshToken = generateRefreshToken(user, { jti }); // token utils should accept jti

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

    const hashedPassword = await argon2.hash(password);
    const user = await repo.create({ name, email, passwordHash: hashedPassword, role });

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
      payload = jwt.verify(refreshToken, config.refreshTokenSecret); // ✅ Use config for consistency
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
