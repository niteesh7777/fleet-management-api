// Quick script to check existing companies in database
import mongoose from 'mongoose';
import { config } from './src/config/env.js';

async function checkCompanies() {
  try {
    await mongoose.connect(config.mongoUri);
    console.log('✅ Connected to MongoDB\n');

    const Company = mongoose.model(
      'Company',
      new mongoose.Schema(
        {
          name: String,
          slug: String,
          ownerUserId: mongoose.Schema.Types.ObjectId,
          plan: String,
          status: String,
        },
        { timestamps: true }
      ),
      'companies'
    );

    const companies = await Company.find({});

    if (companies.length === 0) {
      console.log('❌ No companies found in database.');
      console.log('\nTo create a company, you can:');
      console.log('1. Use the web frontend signup');
      console.log('2. Use the platform signup API:\n');
      console.log('curl -X POST http://localhost:4000/api/v1/platform/auth/signup \\');
      console.log('  -H "Content-Type: application/json" \\');
      console.log(
        "  -d '{\n" +
          '    "companyName": "Test Fleet Company",\n' +
          '    "slug": "test-fleet",\n' +
          '    "ownerName": "Admin User",\n' +
          '    "ownerEmail": "admin@testfleet.com",\n' +
          '    "password": "Password123!"\n' +
          "  }'"
      );
    } else {
      console.log(`✅ Found ${companies.length} company/companies:\n`);
      companies.forEach((c, i) => {
        console.log(`${i + 1}. Company: ${c.name}`);
        console.log(`   Slug: "${c.slug}"`);
        console.log(`   Plan: ${c.plan}`);
        console.log(`   Status: ${c.status}`);
        console.log('');
      });
      console.log('📱 Update driver-app/src/utils/config.js:');
      console.log(`   export const COMPANY_SLUG = "${companies[0].slug}";`);
    }
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
}

checkCompanies();
