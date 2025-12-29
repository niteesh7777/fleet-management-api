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
    /**
     * Platform signup creates:
     * 1. New Company document
     * 2. Company Owner user (platformRole='user', companyRole='company_owner')
     * 3. JWT tokens with tenant context
     *
     * Rules:
     * - Email is unique per company, not globally
     * - Owner user belongs to the created company
     * - No other users exist for this company yet
     */

    // Check if slug is already taken globally
    const existingCompany = await companyRepo.findBySlug(slug);
    if (existingCompany) {
      throw new AppError('Company slug already in use', 400);
    }

    // Note: Email is NOT globally unique - users can use same email in different companies
    // So we don't check email uniqueness here, only during User creation per company

    try {
      // Step 1: Create Company document (owner will be set after user creation)
      const company = await companyRepo.create({
        name: companyName,
        slug,
        ownerUserId: null, // Placeholder - will update after user creation
        plan: 'free',
        status: 'active',
      });

      // Step 2: Hash password
      const hashedPassword = await argon2.hash(password);

      // Step 3: Create Company Owner user using tenant-aware create
      // Signature: create(companyId, data)
      const ownerUser = await userRepo.create(company._id, {
        name: ownerName,
        email: ownerEmail,
        passwordHash: hashedPassword,
        platformRole: 'user', // Regular user at platform level (can manage only their company)
        companyRole: 'company_owner', // Owner role at company level
        isActive: true,
      });

      // Step 4: Update company with owner reference
      await companyRepo.updateById(company._id, {
        ownerUserId: ownerUser._id,
      });

      // Step 5: Generate JWT tokens with tenant context
      const jti = uuidv4();
      const accessToken = generateAccessToken(ownerUser);
      const refreshToken = generateRefreshToken(ownerUser, { jti });

      // Store JTI for token rotation (new signature: setRefreshTokenJti(userId, companyId, jti))
      await userRepo.setRefreshTokenJti(ownerUser._id, company._id, jti);

      // Step 6: Return response with company info and tokens
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
      // If error occurs, attempt cleanup (company may have been created but user creation failed)
      // This is a best-effort cleanup only
      throw err;
    }
  }

  async login({ email, password, companySlug }) {
    // Step 1: Resolve company by slug
    const company = await companyRepo.findBySlug(companySlug);
    if (!company) {
      throw new AppError('Invalid company slug', 400);
    }

    // Step 2: Find user by email AND companyId (tenant-scoped lookup)
    const user = await userRepo.findByEmailAndCompany(company._id, email);

    if (!user) {
      throw new AppError('Invalid email or password', 400); // Generic message for security
    }

    const ok = await argon2.verify(user.passwordHash, password);

    if (!ok) {
      throw new AppError('Invalid email or password', 400); // Generic message for security
    }

    const jti = uuidv4();
    const accessToken = generateAccessToken(user); // embed minimal claims
    const refreshToken = generateRefreshToken(user, { jti }); // token utils should accept jti

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
    // Validate plan limits before creating user
    const company = await companyRepo.findById(companyId);
    if (!company) {
      throw new AppError('Company not found', 404);
    }

    // Check company status and user limit
    const currentUserCount = await userRepo.countByCompany(companyId);
    validateUsersLimit(company, currentUserCount);

    // Check if email already exists in this company
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
      payload = jwt.verify(refreshToken, config.refreshTokenSecret); // ✅ Use config for consistency
    } catch (e) {
      throw new AppError('Invalid or expired refresh token', 403);
    }

    if (!payload?.id || !payload?.jti) throw new AppError('Invalid token payload', 403);

    const user = await userRepo.findById(payload.id);
    if (!user || !user.refreshTokenJti) throw new AppError('Session expired', 403);

    // verify jti matches
    if (user.refreshTokenJti !== payload.jti) throw new AppError('Refresh token revoked', 403);

    // rotate
    const newJti = uuidv4();
    const accessToken = generateAccessToken(user);
    const newRefreshToken = generateRefreshToken(user, { jti: newJti });

    await userRepo.setRefreshTokenJti(user._id, newJti);

    return { accessToken, refreshToken: newRefreshToken };
  }
}
