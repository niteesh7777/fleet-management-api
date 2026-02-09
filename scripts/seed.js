/**
 * Database Seeding Script for Multi-Tenant Fleet Management SaaS
 * Creates realistic test data for multiple companies with proper tenant isolation
 *
 * Usage:
 *   npm run seed              - Seeds database (idempotent)
 *   npm run seed:reset        - Drops database and reseeds
 */

import mongoose from 'mongoose';
import argon2 from 'argon2';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// Setup __dirname for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables
dotenv.config({ path: path.join(__dirname, '../.env') });

// Import models
import Company from '../src/models/Company.js';
import User from '../src/models/User.js';
import Vehicle from '../src/models/Vehicle.js';
import DriverProfile from '../src/models/DriverProfile.js';
import Client from '../src/models/Client.js';
import Route from '../src/models/Route.js';
import Trip from '../src/models/Trip.js';
import MaintenanceLog from '../src/models/MaintenanceLog.js';
import AuditLog from '../src/models/AuditLog.js';
import { PLAN_LIMITS } from '../src/constants/plans.js';
import { dbName } from '../src/constants.js';

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI, { dbName: dbName });
    console.log('✅ MongoDB connected successfully');
  } catch (error) {
    console.error('❌ MongoDB connection failed:', error.message);
    process.exit(1);
  }
};

// Utility: Generate consistent test password hash
const TEST_PASSWORD = 'Test@123';
let hashedPassword;

const getHashedPassword = async () => {
  if (!hashedPassword) {
    hashedPassword = await argon2.hash(TEST_PASSWORD);
  }
  return hashedPassword;
};

// Utility: Create audit log
const createAuditLog = async (companyId, action, entityType, entityId, userId, details) => {
  return await AuditLog.create({
    companyId,
    action,
    entityType,
    entityId,
    userId,
    performedBy: userId,
    details,
    changes: details,
  });
};

/**
 * SEED COMPANIES AND OWNERS
 * Creates companies with their owner users (atomically)
 */
const seedCompaniesAndOwners = async () => {
  console.log('\n📦 Seeding Companies and Owners...');

  const password = await getHashedPassword();

  const companiesData = [
    {
      name: 'Acme Logistics',
      slug: 'acme-logistics',
      subscriptionPlan: 'professional',
      status: 'active',
      ownerName: 'Acme Logistics Owner',
      ownerEmail: 'owner@example.com',
      settings: {
        timezone: 'Asia/Kolkata',
        currency: 'INR',
        language: 'en',
        dateFormat: 'DD/MM/YYYY',
      },
      contactInfo: {
        phone: '+91-9876543210',
        email: 'contact@acmelogistics.com',
        address: '123 Business Park, Mumbai, Maharashtra - 400001',
        website: 'https://acmelogistics.com',
      },
    },
    {
      name: 'Swift Transport Co',
      slug: 'swift-transport',
      subscriptionPlan: 'starter',
      status: 'active',
      ownerName: 'Swift Transport Owner',
      ownerEmail: 'owner@example.com',
      settings: {
        timezone: 'Asia/Kolkata',
        currency: 'INR',
        language: 'en',
        dateFormat: 'DD/MM/YYYY',
      },
      contactInfo: {
        phone: '+91-9988776655',
        email: 'info@swifttransport.com',
        address: '45 Industrial Area, Pune, Maharashtra - 411001',
        website: 'https://swifttransport.com',
      },
    },
    {
      name: 'Green Fleet Services',
      slug: 'green-fleet',
      subscriptionPlan: 'free',
      status: 'active',
      ownerName: 'Green Fleet Owner',
      ownerEmail: 'owner@example.com',
      settings: {
        timezone: 'Asia/Kolkata',
        currency: 'INR',
        language: 'en',
        dateFormat: 'DD/MM/YYYY',
      },
      contactInfo: {
        phone: '+91-9123456789',
        email: 'hello@greenfleet.com',
        address: '78 Eco Park, Bangalore, Karnataka - 560001',
        website: 'https://greenfleet.com',
      },
    },
  ];

  const companies = [];
  const owners = [];

  for (const data of companiesData) {
    const existingCompany = await Company.findOne({ slug: data.slug });

    if (existingCompany) {
      console.log(`  ℹ️  Company "${data.name}" (${data.slug}) already exists`);
      companies.push(existingCompany);

      // Find existing owner
      const existingOwner = await User.findById(existingCompany.ownerUserId);
      if (existingOwner) {
        owners.push(existingOwner);
      }
      continue;
    }

    // Create company with temporary owner
    const company = await Company.create({
      name: data.name,
      slug: data.slug,
      plan: data.subscriptionPlan,
      status: data.status,
      settings: data.settings,
      contactInfo: data.contactInfo,
      ownerUserId: new mongoose.Types.ObjectId(), // Temporary ID
    });

    // Create owner user
    const owner = await User.create({
      name: data.ownerName,
      email: data.ownerEmail,
      passwordHash: password,
      platformRole: 'user',
      companyRole: 'company_owner',
      companyId: company._id,
      isActive: true,
    });

    // Update company with real owner ID
    company.ownerUserId = owner._id;
    await company.save();

    console.log(
      `  ✅ Created company: ${company.name} (${company.plan} plan) with owner: ${owner.name}`
    );

    companies.push(company);
    owners.push(owner);

    // Create audit log
    await createAuditLog(company._id, 'user_creation', 'user', owner._id, owner._id, {
      userName: owner.name,
      role: owner.companyRole,
    });
  }

  return { companies, owners };
};

/**
 * SEED ADDITIONAL USERS
 * Creates admin, manager, and driver users for each company (excluding owners)
 */
const seedAdditionalUsers = async (companies, owners) => {
  console.log('\n👥 Seeding Additional Users...');

  const password = await getHashedPassword();
  const usersData = [];

  for (const company of companies) {
    const companyUsers = [
      {
        name: `${company.name} Admin`,
        email: 'admin@example.com',
        passwordHash: password,
        platformRole: 'user',
        companyRole: 'company_admin',
        companyId: company._id,
        isActive: true,
      },
      {
        name: `${company.name} Manager`,
        email: 'manager@example.com',
        passwordHash: password,
        platformRole: 'user',
        companyRole: 'company_manager',
        companyId: company._id,
        isActive: true,
      },
    ];

    // Add drivers based on plan limits
    const planLimits = PLAN_LIMITS[company.plan];
    const driverCount = Math.min(3, planLimits?.maxDrivers || 3);

    for (let i = 1; i <= driverCount; i++) {
      companyUsers.push({
        name: `Driver ${i}`,
        email: `driver${i}@example.com`,
        passwordHash: password,
        platformRole: 'user',
        companyRole: 'company_driver',
        companyId: company._id,
        isActive: true,
      });
    }

    usersData.push(...companyUsers);
  }

  const createdUsers = [...owners]; // Include owners in the returned array

  for (const userData of usersData) {
    const existing = await User.findOne({
      email: userData.email,
      companyId: userData.companyId,
    });

    if (existing) {
      createdUsers.push(existing);
    } else {
      const user = await User.create(userData);
      console.log(`  ✅ Created user: ${user.name} (${user.companyRole}) for ${user.companyId}`);
      createdUsers.push(user);

      // Create audit log
      await createAuditLog(user.companyId, 'user_creation', 'user', user._id, user._id, {
        userName: user.name,
        role: user.companyRole,
      });
    }
  }

  return createdUsers;
};

/**
 * SEED VEHICLES
 * Creates vehicles for each company respecting plan limits
 */
const seedVehicles = async (companies, users) => {
  console.log('\n🚚 Seeding Vehicles...');

  const vehicleTemplates = [
    {
      type: 'Truck',
      make: 'Tata',
      model: 'LPT 1612',
      registrationState: 'MH',
      capacity: 16000,
      status: 'available',
    },
    {
      type: 'Mini Truck',
      make: 'Mahindra',
      model: 'Bolero Pickup',
      registrationState: 'MH',
      capacity: 1500,
      status: 'available',
    },
    {
      type: 'Trailer',
      make: 'Ashok Leyland',
      model: '4825',
      registrationState: 'DL',
      capacity: 24000,
      status: 'in-trip',
    },
    {
      type: 'Van',
      make: 'Maruti Suzuki',
      model: 'Eeco Cargo',
      registrationState: 'KA',
      capacity: 600,
      status: 'available',
    },
    {
      type: 'Truck',
      make: 'Eicher',
      model: 'Pro 3015',
      registrationState: 'GJ',
      capacity: 7000,
      status: 'maintenance',
    },
  ];

  const createdVehicles = [];
  let vehicleCounter = 1;

  for (const company of companies) {
    const planLimits = PLAN_LIMITS[company.plan];
    const vehicleCount = Math.min(vehicleTemplates.length, planLimits?.maxVehicles || 5);
    const companyAdmin = users.find(
      (u) => u.companyId.toString() === company._id.toString() && u.companyRole === 'company_admin'
    );

    for (let i = 0; i < vehicleCount; i++) {
      const template = vehicleTemplates[i];
      const vehicleNo = `${template.registrationState}${String(vehicleCounter).padStart(2, '0')}AB${String(1000 + i).slice(-4)}`;

      const existing = await Vehicle.findOne({
        companyId: company._id,
        vehicleNo,
      });

      if (existing) {
        createdVehicles.push(existing);
        continue;
      }

      const vehicle = await Vehicle.create({
        companyId: company._id,
        vehicleNo,
        type: template.type,
        make: template.make,
        model: template.model,
        year: 2022 + (i % 3),
        status: template.status,
        capacityKg: template.capacity,
        fuelType: i % 2 === 0 ? 'Diesel' : 'Petrol',
        mileage: Math.floor(Math.random() * 50000) + 10000,
        lastServiceDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
        nextServiceDue: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000),
        insurance: {
          policyNumber: `POL-${company.slug.toUpperCase()}-${1000 + i}`,
          provider: i % 2 === 0 ? 'ICICI Lombard' : 'HDFC ERGO',
          expiryDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
        },
        documents: {
          rcBookUrl: `/uploads/rc/${vehicleNo}-rc.pdf`,
          insuranceUrl: `/uploads/insurance/${vehicleNo}-insurance.pdf`,
          pollutionCertUrl: `/uploads/pollution/${vehicleNo}-pollution.pdf`,
        },
      });

      console.log(
        `  ✅ Created vehicle: ${vehicle.vehicleNo} (${vehicle.type}) for ${company.name}`
      );
      createdVehicles.push(vehicle);

      // Create audit log
      if (companyAdmin) {
        await createAuditLog(
          company._id,
          'vehicle_creation',
          'vehicle',
          vehicle._id,
          companyAdmin._id,
          { vehicleNo: vehicle.vehicleNo, type: vehicle.type }
        );
      }
    }

    vehicleCounter++;
  }

  return createdVehicles;
};

/**
 * SEED DRIVER PROFILES
 * Creates driver profiles for driver users
 */
const seedDriverProfiles = async (companies, users) => {
  console.log('\n🚗 Seeding Driver Profiles...');

  const createdProfiles = [];

  for (const company of companies) {
    const drivers = users.filter(
      (u) => u.companyId.toString() === company._id.toString() && u.companyRole === 'company_driver'
    );

    for (let i = 0; i < drivers.length; i++) {
      const driver = drivers[i];
      const licenseNo = `${company.slug.toUpperCase().slice(0, 2)}${String(i + 1).padStart(2, '0')}${String(Date.now()).slice(-8)}`;

      const existing = await DriverProfile.findOne({
        companyId: company._id,
        userId: driver._id,
      });

      if (existing) {
        createdProfiles.push(existing);
        continue;
      }

      const profile = await DriverProfile.create({
        companyId: company._id,
        userId: driver._id,
        licenseNo,
        licenseExpiry: new Date(Date.now() + 730 * 24 * 60 * 60 * 1000), // 2 years
        contact: {
          phone: `+9198${String(10000000 + i).slice(-8)}`,
          emergencyContact: `+9197${String(10000000 + i).slice(-8)}`,
          address: `${10 + i} Driver Colony, ${company.contactInfo?.address?.split(',')[1] || 'India'}`,
        },
        status: i === 0 ? 'on-trip' : 'active',
        experienceYears: 3 + (i % 10),
        aadharNo: `${1000 + i}${String(Date.now()).slice(-8)}`,
      });

      console.log(`  ✅ Created driver profile: ${profile.licenseNo} for ${driver.name}`);
      createdProfiles.push(profile);

      // Note: Skip audit log creation - 'driver_creation' not in AuditLog enum
    }
  }

  return createdProfiles;
};

/**
 * SEED CLIENTS
 * Creates client records for each company
 */
const seedClients = async (companies, users) => {
  console.log('\n🏢 Seeding Clients...');

  const clientTemplates = [
    {
      name: 'ABC Manufacturing Ltd',
      type: 'corporate',
      gstin: 'GST001',
      phone: '+919876543210',
      email: 'contact@abcmfg.com',
      city: 'Mumbai',
      state: 'Maharashtra',
    },
    {
      name: 'XYZ Retail Pvt Ltd',
      type: 'corporate',
      gstin: 'GST002',
      phone: '+919988776655',
      email: 'info@xyzretail.com',
      city: 'Pune',
      state: 'Maharashtra',
    },
    {
      name: 'Rajesh Kumar',
      type: 'individual',
      gstin: null,
      phone: '+919123456789',
      email: 'rajesh.k@gmail.com',
      city: 'Bangalore',
      state: 'Karnataka',
    },
  ];

  const createdClients = [];

  for (const company of companies) {
    const companyAdmin = users.find(
      (u) => u.companyId.toString() === company._id.toString() && u.companyRole === 'company_admin'
    );

    for (let i = 0; i < clientTemplates.length; i++) {
      const template = clientTemplates[i];

      const existing = await Client.findOne({
        companyId: company._id,
        name: template.name,
      });

      if (existing) {
        createdClients.push(existing);
        continue;
      }

      const client = await Client.create({
        companyId: company._id,
        name: template.name,
        type: template.type,
        gstNo: template.gstin
          ? `${template.gstin}${company.slug.toUpperCase().slice(0, 3)}${String(100000 + i)}`
          : undefined,
        contact: {
          person: template.type === 'corporate' ? 'Account Manager' : template.name,
          phone: template.phone,
          email: template.email,
        },
        address: `${100 + i} ${template.name} Building, ${template.city}, ${template.state} - 400001`,
        city: template.city,
        state: template.state,
        pincode: `${400001 + i}`,
      });

      console.log(`  ✅ Created client: ${client.name} (${client.type}) for ${company.name}`);
      createdClients.push(client);

      // Note: Skip audit log - 'client_creation' not in AuditLog enum
    }
  }

  return createdClients;
};

/**
 * SEED ROUTES
 * Creates route records for each company
 */
const seedRoutes = async (companies, users) => {
  console.log('\n🗺️  Seeding Routes...');

  const routeTemplates = [
    {
      name: 'Mumbai to Pune Express',
      source: { name: 'Mumbai', lat: 19.076, lng: 72.8777 },
      destination: { name: 'Pune', lat: 18.5204, lng: 73.8567 },
      distance: 148,
      duration: 180,
      waypoints: [{ name: 'Lonavala', lat: 18.7528, lng: 73.4067, stopDurationMin: 15 }],
      tolls: [{ name: 'Khalapur Toll', cost: 320 }],
    },
    {
      name: 'Delhi to Jaipur Highway',
      source: { name: 'Delhi', lat: 28.7041, lng: 77.1025 },
      destination: { name: 'Jaipur', lat: 26.9124, lng: 75.7873 },
      distance: 280,
      duration: 300,
      waypoints: [{ name: 'Shahjahanpur', lat: 27.5545, lng: 76.5371, stopDurationMin: 20 }],
      tolls: [
        { name: 'KMP Toll', cost: 280 },
        { name: 'Shahjahanpur Toll', cost: 180 },
      ],
    },
    {
      name: 'Bangalore to Chennai Route',
      source: { name: 'Bangalore', lat: 12.9716, lng: 77.5946 },
      destination: { name: 'Chennai', lat: 13.0827, lng: 80.2707 },
      distance: 346,
      duration: 360,
      waypoints: [{ name: 'Vellore', lat: 12.9165, lng: 79.1325, stopDurationMin: 25 }],
      tolls: [
        { name: 'Attibele Toll', cost: 150 },
        { name: 'Krishnagiri Toll', cost: 175 },
      ],
    },
  ];

  const createdRoutes = [];

  for (const company of companies) {
    const companyManager = users.find(
      (u) =>
        u.companyId.toString() === company._id.toString() && u.companyRole === 'company_manager'
    );

    for (let i = 0; i < routeTemplates.length; i++) {
      const template = routeTemplates[i];

      const existing = await Route.findOne({
        companyId: company._id,
        name: template.name,
      });

      if (existing) {
        createdRoutes.push(existing);
        continue;
      }

      const route = await Route.create({
        companyId: company._id,
        name: template.name,
        source: template.source,
        destination: template.destination,
        distanceKm: template.distance,
        estimatedDurationHr: template.duration / 60, // Convert minutes to hours
        waypoints: template.waypoints,
        tolls: template.tolls,
        isActive: true,
        createdBy: companyManager?._id,
      });

      console.log(`  ✅ Created route: ${route.name} for ${company.name}`);
      createdRoutes.push(route);

      // Note: Skip audit log - 'route_creation' not in AuditLog enum
    }
  }

  return createdRoutes;
};

/**
 * SEED TRIPS
 * Creates trip records linking vehicles, drivers, routes, and clients
 */
const seedTrips = async (companies, users, vehicles, driverProfiles, routes, clients) => {
  console.log('\n🚛 Seeding Trips...');

  const createdTrips = [];
  let tripCounter = 1;

  for (const company of companies) {
    const companyVehicles = vehicles.filter(
      (v) => v.companyId.toString() === company._id.toString()
    );
    const companyDrivers = driverProfiles.filter(
      (d) => d.companyId.toString() === company._id.toString()
    );
    const companyRoutes = routes.filter((r) => r.companyId.toString() === company._id.toString());
    const companyClients = clients.filter((c) => c.companyId.toString() === company._id.toString());
    const companyManager = users.find(
      (u) =>
        u.companyId.toString() === company._id.toString() && u.companyRole === 'company_manager'
    );

    if (
      !companyVehicles.length ||
      !companyDrivers.length ||
      !companyRoutes.length ||
      !companyClients.length
    ) {
      console.log(`  ⚠️  Skipping trips for ${company.name} - missing prerequisites`);
      continue;
    }

    const tripCount = Math.min(5, companyVehicles.length);

    for (let i = 0; i < tripCount; i++) {
      const vehicle = companyVehicles[i % companyVehicles.length];
      const driver = companyDrivers[i % companyDrivers.length];
      const route = companyRoutes[i % companyRoutes.length];
      const client = companyClients[i % companyClients.length];

      const tripCode = `TRIP-${company.slug.toUpperCase().slice(0, 3)}-${String(tripCounter).padStart(5, '0')}`;

      const existing = await Trip.findOne({
        companyId: company._id,
        tripCode,
      });

      if (existing) {
        createdTrips.push(existing);
        tripCounter++;
        continue;
      }

      // Create trips with different statuses
      const statuses = ['scheduled', 'started', 'in-transit', 'completed', 'cancelled'];
      const status = statuses[i % statuses.length];

      const startTime = new Date(Date.now() - (10 - i) * 24 * 60 * 60 * 1000);
      const endTime =
        status === 'completed'
          ? new Date(startTime.getTime() + route.estimatedDurationHr * 60 * 60 * 1000)
          : null;

      const trip = await Trip.create({
        companyId: company._id,
        tripCode,
        routeId: route._id,
        vehicleIds: [vehicle._id],
        driverIds: [driver._id],
        clientId: client._id,
        startTime,
        endTime,
        estimatedEndTime: new Date(
          startTime.getTime() + route.estimatedDurationHr * 60 * 60 * 1000
        ),
        status,
        tripCost: route.distanceKm * 25, // ₹25 per km
        loadWeightKg: Math.floor(Math.random() * 5000) + 1000, // Random weight between 1000-6000 kg
        goodsInfo: `Goods shipment for ${client.name}`,
        statusHistory: [
          {
            timestamp: startTime,
            status: 'scheduled',
            location: route.source,
            note: 'Trip scheduled',
          },
          ...(status !== 'scheduled'
            ? [
                {
                  timestamp: new Date(startTime.getTime() + 60 * 60 * 1000),
                  status: 'started',
                  location: route.source,
                  note: 'Trip started',
                },
              ]
            : []),
          ...(status === 'completed'
            ? [
                {
                  timestamp: endTime,
                  status: 'completed',
                  location: route.destination,
                  note: 'Trip completed successfully',
                },
              ]
            : []),
        ],
      });

      console.log(`  ✅ Created trip: ${trip.tripCode} (${trip.status}) for ${company.name}`);
      createdTrips.push(trip);

      // Create audit log
      if (companyManager) {
        await createAuditLog(company._id, 'trip_creation', 'trip', trip._id, companyManager._id, {
          tripCode: trip.tripCode,
          status: trip.status,
          route: route.name,
        });
      }

      tripCounter++;
    }
  }

  return createdTrips;
};

/**
 * SEED MAINTENANCE LOGS
 * Creates maintenance records for vehicles
 */
const seedMaintenanceLogs = async (companies, users, vehicles) => {
  console.log('\n🔧 Seeding Maintenance Logs...');

  const serviceTypes = [
    'oil-change',
    'engine-check',
    'tire-replacement',
    'brake-service',
    'general-service',
    'ac-repair',
    'battery-replacement',
  ];

  const createdLogs = [];

  for (const company of companies) {
    const companyVehicles = vehicles.filter(
      (v) => v.companyId.toString() === company._id.toString()
    );
    const companyAdmin = users.find(
      (u) => u.companyId.toString() === company._id.toString() && u.companyRole === 'company_admin'
    );

    for (let i = 0; i < Math.min(companyVehicles.length, 3); i++) {
      const vehicle = companyVehicles[i];
      const serviceType = serviceTypes[i % serviceTypes.length];
      const serviceDate = new Date(Date.now() - (60 - i * 10) * 24 * 60 * 60 * 1000);

      const log = await MaintenanceLog.create({
        companyId: company._id,
        vehicleId: vehicle._id,
        serviceType,
        serviceDate,
        description: `${serviceType.replace('-', ' ').toUpperCase()} performed`,
        cost: Math.floor(Math.random() * 10000) + 2000,
        mileage: vehicle.mileage - Math.floor(Math.random() * 5000),
        nextDueDate: new Date(serviceDate.getTime() + 90 * 24 * 60 * 60 * 1000),
        serviceProvider: {
          name: i % 2 === 0 ? 'City Auto Service' : 'Highway Garage',
          contact: `+9198${String(20000000 + i).slice(-8)}`,
          address: `${200 + i} Service Road, ${company.contactInfo?.address?.split(',')[1] || 'India'}`,
        },
        status: 'completed',
        createdBy: companyAdmin?._id,
      });

      console.log(`  ✅ Created maintenance log: ${log.serviceType} for ${vehicle.vehicleNo}`);
      createdLogs.push(log);

      // Note: Skip audit log - 'maintenance_scheduled' not in AuditLog enum
    }
  }

  return createdLogs;
};

/**
 * MAIN SEED FUNCTION
 */
const seed = async (reset = false) => {
  try {
    await connectDB();

    if (reset) {
      console.log('\n🗑️  Resetting database...');
      await mongoose.connection.dropDatabase();
      console.log('✅ Database dropped successfully');
    }

    console.log('\n🌱 Starting database seeding...\n');
    console.log('═'.repeat(50));

    // Seed in order due to dependencies
    const { companies, owners } = await seedCompaniesAndOwners();
    const users = await seedAdditionalUsers(companies, owners);
    const vehicles = await seedVehicles(companies, users);
    const driverProfiles = await seedDriverProfiles(companies, users);
    const clients = await seedClients(companies, users);
    const routes = await seedRoutes(companies, users);
    const trips = await seedTrips(companies, users, vehicles, driverProfiles, routes, clients);
    const maintenanceLogs = await seedMaintenanceLogs(companies, users, vehicles);

    console.log('\n═'.repeat(50));
    console.log('\n✅ Database seeding completed successfully!\n');

    console.log('📊 Summary:');
    console.log(`  Companies: ${companies.length}`);
    console.log(`  Users: ${users.length}`);
    console.log(`  Vehicles: ${vehicles.length}`);
    console.log(`  Driver Profiles: ${driverProfiles.length}`);
    console.log(`  Clients: ${clients.length}`);
    console.log(`  Routes: ${routes.length}`);
    console.log(`  Trips: ${trips.length}`);
    console.log(`  Maintenance Logs: ${maintenanceLogs.length}`);

    console.log('\n📝 Test Credentials:');
    console.log('  Password for all users: Test@123\n');

    companies.forEach((company) => {
      console.log(`  ${company.name} (${company.slug}):`);
      console.log(`    Owner: owner@example.com`);
      console.log(`    Admin: admin@example.com`);
      console.log(`    Manager: manager@example.com`);
      const driverCount = users.filter(
        (u) =>
          u.companyId.toString() === company._id.toString() && u.companyRole === 'company_driver'
      ).length;
      if (driverCount > 0) {
        console.log(
          `    Drivers: driver1@example.com${driverCount > 1 ? ` - driver${driverCount}@example.com` : ''}`
        );
      }
      console.log('');
    });
  } catch (error) {
    console.error('\n❌ Seeding failed:', error);
    throw error;
  } finally {
    await mongoose.connection.close();
    console.log('🔌 Database connection closed');
  }
};

// Parse command line arguments
const args = process.argv.slice(2);
const reset = args.includes('--reset');

// Run seeding
seed(reset)
  .then(() => {
    console.log('\n✨ Seeding process completed');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n💥 Seeding process failed:', error);
    process.exit(1);
  });
