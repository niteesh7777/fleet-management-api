import argon2 from 'argon2';
import jwt from 'jsonwebtoken';
import UserRepository from '../repositories/user.repository.js';
import AppError from '../utils/appError.js';
import { generateAccessToken, generateRefreshToken } from '../utils/token.utils.js';
import { v4 as uuidv4 } from 'uuid';

const repo = new UserRepository();

export default class AuthService {
  async login({ email, password }) {
    console.log('login - input password:', password);
    const user = await repo.findByEmail(email);
    console.log('checked user:', user);
    if (!user) throw new AppError('Invalid email', 400);

    console.log(`loginservice req.passward: ${password}`);

    const ok = await argon2.verify(user.passwordHash, password);
    //debuging
    console.log(`login passward verification result: ${ok}`);
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
    console.log('Register - input password:', password);
    const existing = await repo.findByEmail(email);
    if (existing) throw new AppError('Email already registered', 400);

    const passwordHash = await argon2.hash(password);
    console.log('Register - generated hash:', passwordHash);
    const user = await repo.create({ name, email, passwordHash, role });
    console.log('Register - user created:', user);

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
