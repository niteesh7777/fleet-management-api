import argon2 from 'argon2';
import jwt from 'jsonwebtoken';
import UserRepository from '../repositories/user.repository.js';
import CompanyRepository from '../repositories/company.repository.js';
import AppError from '../utils/appError.js';
import { generateAccessToken, generateRefreshToken } from '../utils/token.utils.js';
import { v4 as uuidv4 } from 'uuid';
import { config } from '../config/env.js';
import { validateUsersLimit } from '../utils/planValidation.js';

const userRepo = new UserRepository();
const companyRepo = new CompanyRepository();

export default class AuthService {
  async platformSignup({ companyName, slug, ownerName, ownerEmail, password }) {

    const existingCompany = await companyRepo.findBySlug(slug);
    if (existingCompany) {
      throw new AppError('Company slug already in use', 400);
    }

    try {

      const company = await companyRepo.create({
        name: companyName,
        slug,
        ownerUserId: null,
        plan: 'free',
        status: 'active',
      });

      const hashedPassword = await argon2.hash(password);

      const ownerUser = await userRepo.create(company._id, {
        name: ownerName,
        email: ownerEmail,
        passwordHash: hashedPassword,
        platformRole: 'user',
        companyRole: 'company_owner',
        isActive: true,
      });

      await companyRepo.updateById(company._id, {
        ownerUserId: ownerUser._id,
      });

      const jti = uuidv4();
      const accessToken = generateAccessToken(ownerUser);
      const refreshToken = generateRefreshToken(ownerUser, { jti });

      await userRepo.setRefreshTokenJti(ownerUser._id, company._id, jti);

      return {
        user: {
          id: ownerUser._id,
          name: ownerUser.name,
          email: ownerUser.email,
          platformRole: ownerUser.platformRole,
          companyRole: ownerUser.companyRole,
        },
        company: {
          id: company._id,
          name: company.name,
          slug: company.slug,
          plan: company.plan,
          status: company.status,
        },
        accessToken,
        refreshToken,
      };
    } catch (err) {

      throw err;
    }
  }

  async login({ email, password, companySlug }) {

    const company = await companyRepo.findBySlug(companySlug);
    if (!company) {
      throw new AppError('Invalid company slug', 400);
    }

    const user = await userRepo.findByEmailAndCompany(company._id, email);

    if (!user) {
      throw new AppError('Invalid email or password', 400);
    }

    const ok = await argon2.verify(user.passwordHash, password);

    if (!ok) {
      throw new AppError('Invalid email or password', 400);
    }

    const jti = uuidv4();
    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user, { jti });

    await userRepo.setRefreshTokenJti(user._id, jti);

    const safeUser = {
      id: user._id,
      name: user.name,
      email: user.email,
      companyRole: user.companyRole,
      platformRole: user.platformRole,
      companyId: user.companyId,
    };

    return { user: safeUser, accessToken, refreshToken };
  }

  async register({ name, email, password, role, companyId }) {

    const company = await companyRepo.findById(companyId);
    if (!company) {
      throw new AppError('Company not found', 404);
    }

    const currentUserCount = await userRepo.countByCompany(companyId);
    validateUsersLimit(company, currentUserCount);

    const existing = await userRepo.findByEmailInCompany(email, companyId);
    if (existing) throw new AppError('Email already registered in this company', 400);

    const hashedPassword = await argon2.hash(password);
    const user = await userRepo.create({ name, email, passwordHash: hashedPassword, role });

    return {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
    };
  }

  async logout(userId, companyId) {
    await userRepo.clearRefreshToken(userId, companyId);
  }

  async refresh(refreshToken) {
    let payload;
    try {
      payload = jwt.verify(refreshToken, config.refreshTokenSecret);
    } catch (e) {
      throw new AppError('Invalid or expired refresh token', 403);
    }

    if (!payload?.id || !payload?.jti) throw new AppError('Invalid token payload', 403);

    const user = await userRepo.findById(payload.id);
    if (!user || !user.refreshTokenJti) throw new AppError('Session expired', 403);

    if (user.refreshTokenJti !== payload.jti) throw new AppError('Refresh token revoked', 403);

    const newJti = uuidv4();
    const accessToken = generateAccessToken(user);
    const newRefreshToken = generateRefreshToken(user, { jti: newJti });

    await userRepo.setRefreshTokenJti(user._id, newJti);

    return { accessToken, refreshToken: newRefreshToken };
  }
}
