import mongoose from 'mongoose';
import dotenv from 'dotenv';
import DriverProfile from './src/models/DriverProfile.js';
import User from './src/models/User.js';

dotenv.config();

async function createDriverProfile() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB');

    // Find the test driver user
    const driverUser = await User.findOne({ email: 'test.driver@example.com' });

    if (!driverUser) {
      console.log('❌ Driver user not found. Please create the user first.');
      process.exit(1);
    }

    console.log('✅ Found driver user:', driverUser.email);

    // Check if driver profile already exists
    const existingProfile = await DriverProfile.findOne({ userId: driverUser._id });

    if (existingProfile) {
      console.log('✅ Driver profile already exists:', existingProfile);
      process.exit(0);
    }

    // Create driver profile
    const driverProfile = await DriverProfile.create({
      userId: driverUser._id,
      licenseNo: 'DL-TEST-' + Date.now(),
      contact: {
        phone: '+1234567890',
        address: '123 Test Street, Test City',
      },
      experienceYears: 3,
      status: 'active',
      currentLocation: {
        lat: 0,
        lng: 0,
        lastUpdated: new Date(),
      },
    });

    console.log('✅ Driver profile created successfully:', driverProfile);
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

createDriverProfile();
