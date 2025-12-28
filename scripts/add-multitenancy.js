/**
 * Migration Script: Add Multi-Tenancy Support
 *
 * This script safely adds companyId to all existing documents.
 *
 * Usage:
 * node backend/scripts/add-multitenancy.js
 *
 * BEFORE RUNNING:
 * 1. Backup your database
 * 2. Test in development/staging first
 * 3. Review created DEFAULT company
 * 4. Verify data integrity after migration
 *
 * SAFETY NOTES:
 * - Script checks if companyId already exists before adding
 * - Idempotent: Can be run multiple times safely
 * - Creates DEFAULT company with predefined ID
 * - Does NOT modify existing companyId values
 * - Logs all operations
 */

import mongoose from 'mongoose';
import { config } from '../src/config/env.js';
import { dbName } from '../src/constants.js';
import Company from '../src/models/Company.js';
import User from '../src/models/User.js';
import Vehicle from '../src/models/Vehicle.js';
import DriverProfile from '../src/models/DriverProfile.js';
import Trip from '../src/models/Trip.js';
import Route from '../src/models/Route.js';
import Client from '../src/models/Client.js';
import MaintenanceLog from '../src/models/MaintenanceLog.js';
import AuditLog from '../src/models/AuditLog.js';

const DEFAULT_COMPANY_ID = new mongoose.Types.ObjectId('000000000000000000000000');
const DEFAULT_COMPANY_SLUG = 'default-company';

async function connectDB() {
  try {
    await mongoose.connect(`${config.mongoURI}/${dbName}`, {
      autoIndex: false,
      maxPoolSize: 10,
    });
    console.log('✅ Connected to MongoDB');
  } catch (err) {
    console.error('❌ MongoDB connection failed:', err.message);
    process.exit(1);
  }
}

async function closeDB() {
  await mongoose.disconnect();
  console.log('✅ Disconnected from MongoDB');
}

async function createDefaultCompany() {
  console.log('\n📦 Creating DEFAULT company...');
  try {
    // Check if DEFAULT company already exists
    const existing = await Company.findById(DEFAULT_COMPANY_ID);
    if (existing) {
      console.log('✅ DEFAULT company already exists');
      return existing;
    }

    const company = new Company({
      _id: DEFAULT_COMPANY_ID,
      name: 'Default Company',
      slug: DEFAULT_COMPANY_SLUG,
      ownerUserId: null, // TODO: Set to actual admin user after creation
      plan: 'professional',
      status: 'active',
    });

    await company.save();
    console.log(`✅ DEFAULT company created with ID: ${DEFAULT_COMPANY_ID}`);
    return company;
  } catch (err) {
    console.error('❌ Failed to create DEFAULT company:', err.message);
    throw err;
  }
}

async function migrateModel(Model, modelName) {
  console.log(`\n📋 Migrating ${modelName}...`);
  try {
    const count = await Model.countDocuments({});
    if (count === 0) {
      console.log(`   (No documents to migrate)`);
      return;
    }

    // Find documents without companyId
    const withoutCompanyId = await Model.countDocuments({ companyId: { $exists: false } });

    if (withoutCompanyId === 0) {
      console.log(`   ✅ All ${count} documents already have companyId`);
      return;
    }

    // Add companyId to documents missing it
    const result = await Model.updateMany(
      { companyId: { $exists: false } },
      { $set: { companyId: DEFAULT_COMPANY_ID } }
    );

    console.log(
      `   ✅ Migrated ${result.modifiedCount}/${count} documents (${count - result.modifiedCount} already had companyId)`
    );
  } catch (err) {
    console.error(`   ❌ Failed to migrate ${modelName}:`, err.message);
    throw err;
  }
}

async function createIndexes() {
  console.log('\n🔑 Creating tenant-aware indexes...');
  try {
    // These indexes should already be defined in schemas, but we ensure they exist
    await User.collection.createIndex({ companyId: 1, email: 1 }, { unique: true });
    await Vehicle.collection.createIndex({ companyId: 1, vehicleNo: 1 }, { unique: true });
    await DriverProfile.collection.createIndex({ companyId: 1, licenseNo: 1 }, { unique: true });
    await DriverProfile.collection.createIndex({ companyId: 1, userId: 1 }, { unique: true });
    await Trip.collection.createIndex({ companyId: 1, tripCode: 1 }, { unique: true });
    await Route.collection.createIndex({ companyId: 1, name: 1 }, { unique: true });
    await Client.collection.createIndex({ companyId: 1, name: 1 }, { unique: true });

    console.log('   ✅ All indexes created successfully');
  } catch (err) {
    console.error('   ❌ Failed to create indexes:', err.message);
    throw err;
  }
}

async function verifyMigration() {
  console.log('\n✔️ Verifying migration...');
  try {
    const checks = [
      { model: User, name: 'User' },
      { model: Vehicle, name: 'Vehicle' },
      { model: DriverProfile, name: 'DriverProfile' },
      { model: Trip, name: 'Trip' },
      { model: Route, name: 'Route' },
      { model: Client, name: 'Client' },
      { model: MaintenanceLog, name: 'MaintenanceLog' },
      { model: AuditLog, name: 'AuditLog' },
    ];

    let allOk = true;
    for (const check of checks) {
      const total = await check.model.countDocuments({});
      const missing = await check.model.countDocuments({ companyId: { $exists: false } });

      if (missing > 0) {
        console.log(`   ⚠️  ${check.name}: ${missing}/${total} documents missing companyId`);
        allOk = false;
      } else {
        console.log(`   ✅ ${check.name}: All ${total} documents have companyId`);
      }
    }

    return allOk;
  } catch (err) {
    console.error('   ❌ Verification failed:', err.message);
    throw err;
  }
}

async function main() {
  console.log('🚀 Starting multi-tenancy migration...\n');
  console.log('WARNING: This script will:');
  console.log('  1. Create a DEFAULT company');
  console.log('  2. Assign all existing data to DEFAULT company');
  console.log('  3. Create new indexes for tenant isolation\n');
  console.log('BACKUP YOUR DATABASE BEFORE PROCEEDING!\n');

  try {
    await connectDB();
    await createDefaultCompany();

    // Migrate all models
    await migrateModel(User, 'User');
    await migrateModel(Vehicle, 'Vehicle');
    await migrateModel(DriverProfile, 'DriverProfile');
    await migrateModel(Trip, 'Trip');
    await migrateModel(Route, 'Route');
    await migrateModel(Client, 'Client');
    await migrateModel(MaintenanceLog, 'MaintenanceLog');
    await migrateModel(AuditLog, 'AuditLog');

    await createIndexes();
    const verified = await verifyMigration();

    if (verified) {
      console.log('\n✅ Migration completed successfully!');
      console.log('\n📝 NEXT STEPS:');
      console.log('  1. Set ownerUserId on DEFAULT company to your admin user');
      console.log('  2. Update auth service to handle new role fields');
      console.log('  3. Update controllers to pass companyId to services');
      console.log('  4. Test multi-tenancy in development');
      console.log('  5. Deploy to staging for final verification');
    } else {
      console.log('\n⚠️  Migration completed with warnings. Review above.');
    }
  } catch (err) {
    console.error('\n❌ Migration failed:', err.message);
    console.error(err);
    process.exit(1);
  } finally {
    await closeDB();
  }
}

main();
