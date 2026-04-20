const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  console.log('Starting database seed...');

  // Create admin user
  const adminPassword = await bcrypt.hash('admin123456', 12);
  const admin = await prisma.user.upsert({
    where: { email: 'admin@boxinator.com' },
    update: {},
    create: {
      email: 'admin@boxinator.com',
      password: adminPassword,
      firstName: 'Admin',
      lastName: 'User',
      accountType: 'ADMINISTRATOR',
      isEmailVerified: true
    }
  });
  console.log(`Created admin user: ${admin.email}`);

  // Create test registered user
  const userPassword = await bcrypt.hash('user123456', 12);
  const testUser = await prisma.user.upsert({
    where: { email: 'user@boxinator.com' },
    update: {},
    create: {
      email: 'user@boxinator.com',
      password: userPassword,
      firstName: 'John',
      lastName: 'Doe',
      accountType: 'REGISTERED_USER',
      isEmailVerified: true,
      dateOfBirth: new Date('1990-01-01')
    }
  });
  console.log(`Created test user: ${testUser.email}`);

  // Create guest user
  const guestUser = await prisma.user.upsert({
    where: { email: 'guest@example.com' },
    update: {},
    create: {
      email: 'guest@example.com',
      firstName: null,
      lastName: null,
      accountType: 'GUEST',
      isEmailVerified: true
    }
  });
  console.log(`Created guest user: ${guestUser.email}`);

  // Create countries with multipliers
  const countries = [
    // Nordic countries (flat fee only)
    { name: 'Norway', code: 'NO', multiplier: 0.0, isActive: true },
    { name: 'Sweden', code: 'SE', multiplier: 0.0, isActive: true },
    { name: 'Denmark', code: 'DK', multiplier: 0.0, isActive: true },
    
    // European countries
    { name: 'Germany', code: 'DE', multiplier: 5.0, isActive: true },
    { name: 'United Kingdom', code: 'GB', multiplier: 6.0, isActive: true },
    { name: 'France', code: 'FR', multiplier: 5.5, isActive: true },
    { name: 'Netherlands', code: 'NL', multiplier: 4.5, isActive: true },
    { name: 'Belgium', code: 'BE', multiplier: 4.5, isActive: true },
    { name: 'Switzerland', code: 'CH', multiplier: 7.0, isActive: true },
    { name: 'Austria', code: 'AT', multiplier: 5.5, isActive: true },
    { name: 'Italy', code: 'IT', multiplier: 6.5, isActive: true },
    { name: 'Spain', code: 'ES', multiplier: 7.0, isActive: true },
    { name: 'Portugal', code: 'PT', multiplier: 7.5, isActive: true },
    { name: 'Finland', code: 'FI', multiplier: 3.0, isActive: true },
    { name: 'Iceland', code: 'IS', multiplier: 4.0, isActive: true },
    
    // North America
    { name: 'United States', code: 'US', multiplier: 15.0, isActive: true },
    { name: 'Canada', code: 'CA', multiplier: 12.0, isActive: true },
    { name: 'Mexico', code: 'MX', multiplier: 18.0, isActive: true },
    
    // Asia
    { name: 'Japan', code: 'JP', multiplier: 25.0, isActive: true },
    { name: 'South Korea', code: 'KR', multiplier: 22.0, isActive: true },
    { name: 'China', code: 'CN', multiplier: 20.0, isActive: true },
    { name: 'Singapore', code: 'SG', multiplier: 28.0, isActive: true },
    { name: 'Hong Kong', code: 'HK', multiplier: 26.0, isActive: true },
    { name: 'India', code: 'IN', multiplier: 24.0, isActive: true },
    { name: 'Thailand', code: 'TH', multiplier: 22.0, isActive: true },
    
    // Oceania
    { name: 'Australia', code: 'AU', multiplier: 30.0, isActive: true },
    { name: 'New Zealand', code: 'NZ', multiplier: 32.0, isActive: true },
    
    // Other
    { name: 'Russia', code: 'RU', multiplier: 18.0, isActive: true },
    { name: 'Brazil', code: 'BR', multiplier: 25.0, isActive: true },
    { name: 'South Africa', code: 'ZA', multiplier: 22.0, isActive: true }
  ];

  for (const country of countries) {
    const createdCountry = await prisma.country.upsert({
      where: { name: country.name },
      update: {},
      create: {
        name: country.name,
        multiplier: country.multiplier,
        isActive: country.isActive
      }
    });
    console.log(`Created country: ${createdCountry.name} (multiplier: ${createdCountry.multiplier})`);
  }

  // Create some sample shipments
  const norwayCountry = await prisma.country.findUnique({ where: { name: 'Norway' } });
  const germanyCountry = await prisma.country.findUnique({ where: { name: 'Germany' } });
  const usaCountry = await prisma.country.findUnique({ where: { name: 'United States' } });

  // Sample shipment for test user
  const shipment1 = await prisma.shipment.create({
    data: {
      recipientName: 'Jane Smith',
      recipientEmail: 'jane.smith@example.com',
      recipientAddress: '123 Main St, Berlin, Germany',
      weight: 2.0,
      length: 30.0,
      width: 20.0,
      height: 15.0,
      boxColor: 'rgba(255, 0, 0, 1)',
      totalCost: 200 + (2 * germanyCountry.multiplier), // 210 Kr
      userId: testUser.id,
      destinationCountryId: germanyCountry.id
    }
  });

  await prisma.statusHistory.create({
    data: {
      shipmentId: shipment1.id,
      status: 'CREATED',
      notes: 'Shipment created'
    }
  });

  await prisma.statusHistory.create({
    data: {
      shipmentId: shipment1.id,
      status: 'RECEIVED',
      notes: 'Package received at facility'
    }
  });

  // Sample shipment for guest user
  const shipment2 = await prisma.shipment.create({
    data: {
      recipientName: 'Bob Wilson',
      recipientEmail: 'bob.wilson@example.com',
      recipientAddress: '456 Oak Ave, New York, NY, USA',
      weight: 5.0,
      length: 40.0,
      width: 30.0,
      height: 20.0,
      boxColor: 'rgba(0, 255, 0, 0.8)',
      totalCost: 200 + (5 * usaCountry.multiplier), // 275 Kr
      userId: guestUser.id,
      destinationCountryId: usaCountry.id
    }
  });

  await prisma.statusHistory.create({
    data: {
      shipmentId: shipment2.id,
      status: 'CREATED',
      notes: 'Shipment created'
    }
  });

  // DELIVERED shipment
  const shipment3 = await prisma.shipment.create({
    data: {
      recipientName: 'Alice Johnson',
      recipientEmail: 'alice.johnson@example.com',
      recipientAddress: '789 Pine St, Oslo, Norway',
      weight: 1.0,
      length: 25.0,
      width: 15.0,
      height: 10.0,
      boxColor: 'rgba(0, 0, 255, 1)',
      totalCost: 200, // Nordic country, no multiplier
      userId: testUser.id,
      destinationCountryId: norwayCountry.id
    }
  });

  await prisma.statusHistory.create({
    data: {
      shipmentId: shipment3.id,
      status: 'CREATED',
      notes: 'Shipment created'
    }
  });

  await prisma.statusHistory.create({
    data: {
      shipmentId: shipment3.id,
      status: 'RECEIVED',
      notes: 'Package received at facility'
    }
  });

  await prisma.statusHistory.create({
    data: {
      shipmentId: shipment3.id,
      status: 'IN_TRANSIT',
      notes: 'Package in transit'
    }
  });

  await prisma.statusHistory.create({
    data: {
      shipmentId: shipment3.id,
      status: 'DELIVERED',
      notes: 'Package delivered'
    }
  });

  console.log('Database seed DELIVERED successfully!');
  console.log('\nTest accounts created:');
  console.log('Admin: admin@boxinator.com / admin123456');
  console.log('User: user@boxinator.com / user123456');
  console.log('Guest: guest@example.com (no password needed)');
}

main()
  .catch((e) => {
    console.error('Error during seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
