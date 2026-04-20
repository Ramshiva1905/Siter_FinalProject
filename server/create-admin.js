require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

(async () => {
  try {
    // First, check existing users
    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        accountType: true,
        isEmailVerified: true,
        firstName: true,
        lastName: true
      }
    });
    console.log('Existing users:', JSON.stringify(users, null, 2));

    // Check if admin user exists
    const adminUser = await prisma.user.findUnique({
      where: { email: 'admin@boxinator.com' }
    });

    if (adminUser) {
      console.log('Admin user found, updating to ADMINISTRATOR role and correct password...');
      // Update existing user to admin with correct password
      const hashedPassword = await bcrypt.hash('admin123456', 12);
      const updatedUser = await prisma.user.update({
        where: { email: 'admin@boxinator.com' },
        data: {
          accountType: 'ADMINISTRATOR',
          isEmailVerified: true,
          password: hashedPassword
        }
      });
      console.log('Admin user updated with correct credentials');
    } else {
      console.log('Creating new admin user...');
      // Create admin user
      const hashedPassword = await bcrypt.hash('admin123456', 12);
      const newAdmin = await prisma.user.create({
        data: {
          email: 'admin@boxinator.com',
          password: hashedPassword,
          firstName: 'Admin',
          lastName: 'User',
          accountType: 'ADMINISTRATOR',
          isEmailVerified: true
        }
      });
      console.log('New admin user created:', newAdmin);
    }

  } catch (err) {
    console.error('Error:', err);
  } finally {
    await prisma.$disconnect();
  }
})();
