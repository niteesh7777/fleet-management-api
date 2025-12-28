/**
 * Platform Signup Integration Test
 * Tests the SaaS company onboarding flow
 */

import request from 'supertest';
import app from '../app.js';
import Company from '../models/Company.js';
import User from '../models/User.js';

describe('Platform Signup - POST /api/v1/platform/signup', () => {
  let createdCompanyId;
  let createdUserId;

  // Clean up test data before tests
  beforeAll(async () => {
    // Clear any test data
    await Company.deleteMany({ slug: /^test-/ });
    await User.deleteMany({ email: /^test-.*@example.com$/ });
  });

  // Clean up after tests
  afterAll(async () => {
    if (createdCompanyId) {
      await Company.findByIdAndDelete(createdCompanyId);
    }
    if (createdUserId) {
      await User.findByIdAndDelete(createdUserId);
    }
  });

  describe('Successful signup', () => {
    it('should create company and owner user with valid input', async () => {
      const payload = {
        companyName: 'Test Company Inc',
        slug: 'test-company-001',
        ownerName: 'Test Owner',
        ownerEmail: 'test-owner@example.com',
        password: 'TestPassword123',
      };

      const response = await request(app).post('/api/v1/platform/signup').send(payload).expect(201);

      // Verify response structure
      expect(response.body.success).toBe(true);
      expect(response.body.data.user).toBeDefined();
      expect(response.body.data.company).toBeDefined();
      expect(response.body.data.accessToken).toBeDefined();
      expect(response.body.data.refreshToken).toBeDefined();

      // Verify user data
      expect(response.body.data.user.name).toBe(payload.ownerName);
      expect(response.body.data.user.email).toBe(payload.ownerEmail);
      expect(response.body.data.user.platformRole).toBe('user');
      expect(response.body.data.user.companyRole).toBe('company_owner');

      // Verify company data
      expect(response.body.data.company.name).toBe(payload.companyName);
      expect(response.body.data.company.slug).toBe(payload.slug);
      expect(response.body.data.company.plan).toBe('free');
      expect(response.body.data.company.status).toBe('active');

      // Store for cleanup
      createdCompanyId = response.body.data.company.id;
      createdUserId = response.body.data.user.id;

      // Verify database state
      const company = await Company.findById(createdCompanyId);
      expect(company).toBeDefined();
      expect(company.ownerUserId.toString()).toBe(createdUserId);

      const user = await User.findById(createdUserId);
      expect(user).toBeDefined();
      expect(user.companyId.toString()).toBe(createdCompanyId);
    });
  });

  describe('Validation errors', () => {
    it('should reject invalid email', async () => {
      const payload = {
        companyName: 'Valid Company',
        slug: 'valid-company',
        ownerName: 'Owner',
        ownerEmail: 'invalid-email',
        password: 'ValidPassword123',
      };

      const response = await request(app).post('/api/v1/platform/signup').send(payload).expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('email');
    });

    it('should reject weak password', async () => {
      const payload = {
        companyName: 'Valid Company',
        slug: 'valid-company',
        ownerName: 'Owner',
        ownerEmail: 'owner@test.com',
        password: 'weak',
      };

      const response = await request(app).post('/api/v1/platform/signup').send(payload).expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('password');
    });

    it('should reject invalid slug format', async () => {
      const payload = {
        companyName: 'Valid Company',
        slug: 'INVALID_SLUG',
        ownerName: 'Owner',
        ownerEmail: 'owner@test.com',
        password: 'ValidPassword123',
      };

      const response = await request(app).post('/api/v1/platform/signup').send(payload).expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('slug');
    });

    it('should reject short company name', async () => {
      const payload = {
        companyName: 'A',
        slug: 'valid-slug',
        ownerName: 'Owner',
        ownerEmail: 'owner@test.com',
        password: 'ValidPassword123',
      };

      const response = await request(app).post('/api/v1/platform/signup').send(payload).expect(400);

      expect(response.body.success).toBe(false);
    });
  });

  describe('Duplicate prevention', () => {
    it('should reject duplicate slug', async () => {
      const firstPayload = {
        companyName: 'First Company',
        slug: 'unique-slug-001',
        ownerName: 'Owner One',
        ownerEmail: 'owner-one@test.com',
        password: 'ValidPassword123',
      };

      const duplicatePayload = {
        companyName: 'Second Company',
        slug: 'unique-slug-001', // Same slug
        ownerName: 'Owner Two',
        ownerEmail: 'owner-two@test.com',
        password: 'ValidPassword123',
      };

      // First signup should succeed
      const firstResponse = await request(app)
        .post('/api/v1/platform/signup')
        .send(firstPayload)
        .expect(201);

      createdCompanyId = firstResponse.body.data.company.id;
      createdUserId = firstResponse.body.data.user.id;

      // Second signup with same slug should fail
      const secondResponse = await request(app)
        .post('/api/v1/platform/signup')
        .send(duplicatePayload)
        .expect(400);

      expect(secondResponse.body.success).toBe(false);
      expect(secondResponse.body.message).toContain('slug');
    });

    it('should allow same email in different companies', async () => {
      const email = 'shared-email@test.com';

      const firstPayload = {
        companyName: 'Company A',
        slug: 'company-a-001',
        ownerName: 'Owner',
        ownerEmail: email,
        password: 'ValidPassword123',
      };

      const secondPayload = {
        companyName: 'Company B',
        slug: 'company-b-001',
        ownerName: 'Owner',
        ownerEmail: email, // Same email
        password: 'ValidPassword123',
      };

      // First signup should succeed
      const firstResponse = await request(app)
        .post('/api/v1/platform/signup')
        .send(firstPayload)
        .expect(201);

      const firstCompanyId = firstResponse.body.data.company.id;

      // Second signup with same email should succeed (email is per-company)
      const secondResponse = await request(app)
        .post('/api/v1/platform/signup')
        .send(secondPayload)
        .expect(201);

      const secondCompanyId = secondResponse.body.data.company.id;

      // Verify different companies
      expect(firstCompanyId).not.toBe(secondCompanyId);

      // Verify same email in different companies
      const firstUser = await User.findOne({ email, companyId: firstCompanyId });
      const secondUser = await User.findOne({ email, companyId: secondCompanyId });

      expect(firstUser).toBeDefined();
      expect(secondUser).toBeDefined();
      expect(firstUser._id.toString()).not.toBe(secondUser._id.toString());

      // Cleanup
      await Company.findByIdAndDelete(firstCompanyId);
      await Company.findByIdAndDelete(secondCompanyId);
      await User.findByIdAndDelete(firstUser._id);
      await User.findByIdAndDelete(secondUser._id);
    });
  });

  describe('Security - prevent role override', () => {
    it('should ignore companyId in request', async () => {
      const payload = {
        companyName: 'Test Company',
        slug: 'test-security-001',
        ownerName: 'Owner',
        ownerEmail: 'security@test.com',
        password: 'ValidPassword123',
        companyId: 'invalid-company-id', // Should be ignored
      };

      const response = await request(app).post('/api/v1/platform/signup').send(payload).expect(201);

      // Verify companyId was generated, not from request
      const expectedId = response.body.data.company.id;
      expect(expectedId).not.toBe('invalid-company-id');

      // Cleanup
      await Company.findByIdAndDelete(response.body.data.company.id);
      await User.findByIdAndDelete(response.body.data.user.id);
    });

    it('should enforce platformRole = user', async () => {
      const payload = {
        companyName: 'Test Company',
        slug: 'test-security-002',
        ownerName: 'Owner',
        ownerEmail: 'security2@test.com',
        password: 'ValidPassword123',
        platformRole: 'platform_admin', // Should be ignored
      };

      const response = await request(app).post('/api/v1/platform/signup').send(payload).expect(201);

      // Verify platformRole is always 'user'
      expect(response.body.data.user.platformRole).toBe('user');

      // Cleanup
      await Company.findByIdAndDelete(response.body.data.company.id);
      await User.findByIdAndDelete(response.body.data.user.id);
    });

    it('should enforce companyRole = company_owner', async () => {
      const payload = {
        companyName: 'Test Company',
        slug: 'test-security-003',
        ownerName: 'Owner',
        ownerEmail: 'security3@test.com',
        password: 'ValidPassword123',
        companyRole: 'company_user', // Should be ignored
      };

      const response = await request(app).post('/api/v1/platform/signup').send(payload).expect(201);

      // Verify companyRole is always 'company_owner'
      expect(response.body.data.user.companyRole).toBe('company_owner');

      // Cleanup
      await Company.findByIdAndDelete(response.body.data.company.id);
      await User.findByIdAndDelete(response.body.data.user.id);
    });
  });

  describe('JWT token validation', () => {
    it('should return valid JWT tokens with tenant context', async () => {
      const payload = {
        companyName: 'Test Company',
        slug: 'test-jwt-001',
        ownerName: 'Owner',
        ownerEmail: 'jwt@test.com',
        password: 'ValidPassword123',
      };

      const response = await request(app).post('/api/v1/platform/signup').send(payload).expect(201);

      const { accessToken, refreshToken } = response.body.data;
      const { companyId } = response.body.data.user;

      // Tokens should be JWT format (3 parts separated by dots)
      expect(accessToken.split('.').length).toBe(3);
      expect(refreshToken.split('.').length).toBe(3);

      // Access token should be usable for subsequent requests
      const profileResponse = await request(app)
        .get('/api/v1/users/profile')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200);

      expect(profileResponse.body.data.user.companyId).toBe(companyId);

      // Cleanup
      await Company.findByIdAndDelete(response.body.data.company.id);
      await User.findByIdAndDelete(response.body.data.user.id);
    });
  });
});
