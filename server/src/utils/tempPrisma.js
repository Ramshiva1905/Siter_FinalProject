const { PrismaClient } = require('@prisma/client');

// This is a temporary compatibility layer
// TODO: Remove this once all routes are updated to use getDatabase()
let _tempPrisma = null;

async function getTempPrisma() {
  if (!_tempPrisma) {
    try {
      _tempPrisma = new PrismaClient();
      await _tempPrisma.$connect();
    } catch (error) {
      // If Prisma fails, we'll need to handle this error in the routes
      console.error('Temp Prisma connection failed:', error.message);
      throw error;
    }
  }
  return _tempPrisma;
}

module.exports = { getTempPrisma };
