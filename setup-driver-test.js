// Setup test data for driver mobile app
import mongoose from 'mongoose';
import argon2 from 'argon2';
import { config } from './src/config/env.js';

async function setupTestData() {
  try {
    await mongoose.connect(config.mongoUri);
    console.log('✅ Connected to MongoDB\n');

    // Define schemas
    const Company = mongoose.model(
      'Company',
      new mongoose.Schema(
        {
          name: String,
          slug: String,
          ownerUserId: mongoose.Schema.Types.ObjectId,
          plan: { type: String, default: 'free' },
          status: { type: String, default: 'active' },
        },
        { timestamps: true }
      ),
      'companies'
    );

    const User = mongoose.model(
      'User',
      new mongoose.Schema(
        {
          companyId: mongoose.Schema.Types.ObjectId,
          name: String,
          email: String,
          passwordHash: String,
          platformRole: { type: String, default: 'user' },
          companyRole: String,
          isActive: { type: Boolean, default: true },
        },
        { timestamps: true }
      ),
      'users'
    );

    const DriverProfile = mongoose.model(
      'DriverProfile',
      new mongoose.Schema(
        {
          companyId: mongoose.Schema.Types.ObjectId,
          userId: mongoose.Schema.Types.ObjectId,
          licenseNo: String,
          licenseExpiry: Date,
          experienceYears: Number,
          status: { type: String, default: 'active' },
          phone: String,
        },
        { timestamps: true }
      ),
      'driverprofiles'
    );

    // Check for existing test company
    let company = await Company.findOne({ slug: 'test-fleet' });

    if (!company) {
      console.log('📦 Creating test company...');
      company = await Company.create({
        name: 'Test Fleet Company',
        slug: 'test-fleet',
        plan: 'free',
        status: 'active',
      });
      console.log('✅ Company created:', company.name);
    } else {
      console.log('✅ Found existing company:', company.name);
    }

    // Check for existing driver user
    let driverUser = await User.findOne({
      companyId: company._id,
      email: 'driver@testfleet.com',
    });

    if (!driverUser) {
      console.log('👤 Creating test driver user...');
      const hashedPassword = await argon2.hash('Driver123!');

      driverUser = await User.create({
        companyId: company._id,
        name: 'Test Driver',
        email: 'driver@testfleet.com',
        passwordHash: hashedPassword,
        platformRole: 'user',
        companyRole: 'driver',
        isActive: true,
      });
      console.log('✅ Driver user created');
    } else {
      console.log('✅ Found existing driver user');
      // Update password to known value
      const hashedPassword = await argon2.hash('Driver123!');
      await User.updateOne({ _id: driverUser._id }, { passwordHash: hashedPassword });
      console.log('✅ Password reset to: Driver123!');
    }

    // Check for driver profile
    let driverProfile = await DriverProfile.findOne({ userId: driverUser._id });

    if (!driverProfile) {
      console.log('🚗 Creating driver profile...');
      driverProfile = await DriverProfile.create({
        companyId: company._id,
        userId: driverUser._id,
        licenseNo: 'DL-TEST-001',
        licenseExpiry: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1 year from now
        experienceYears: 5,
        status: 'active',
        phone: '+1234567890',
      });
      console.log('✅ Driver profile created');
    } else {
      console.log('✅ Found existing driver profile');
    }

    // Output credentials
    console.log('\n' + '='.repeat(60));
    console.log('🎉 TEST CREDENTIALS FOR DRIVER MOBILE APP');
    console.log('='.repeat(60));
    console.log('\n📱 Login Credentials:\n');
    console.log('  Company Slug: test-fleet');
    console.log('  Email:        driver@testfleet.com');
    console.log('  Password:     Driver123!');
    console.log('\n' + '='.repeat(60));
    console.log('\n💡 Use these credentials in your driver mobile app login screen\n');
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error(error);
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
}

setupTestData();
