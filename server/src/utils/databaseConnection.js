const { PrismaClient } = require('@prisma/client');
const { MockDatabase } = require('./mockDatabase');
const { SupabaseAdapter } = require('./SupabaseAdapter');
const logger = require('./logger');

let database = null;
/** @type {'prisma'|'supabase-rest'|'mock'|null} */
let connectionType = null;

/**
 * Returns a connected database client (Prisma, SupabaseAdapter, or MockDatabase).
 * Handles fallback logic and logs connection status.
 * @returns {Promise<PrismaClient|SupabaseAdapter|MockDatabase>}
 */
async function getDatabase() {
  if (database) {
    return database;
  }

  // Try Prisma/Supabase connection
  try {
    const prisma = new PrismaClient();
    await prisma.$connect();
    logger.info('Connected to Supabase via Prisma');
    database = prisma;
    connectionType = 'prisma';
    return database;
  } catch (prismaError) {
    logger.warn('Failed to connect via Prisma, trying Supabase REST API', {
      error: prismaError.message
    });

    // Try Supabase REST API
    try {
      const supabaseAdapter = new SupabaseAdapter();
      const isConnected = await supabaseAdapter.testConnection();
      if (isConnected) {
        logger.info('Connected to Supabase via REST API');
        database = supabaseAdapter;
        connectionType = 'supabase-rest';
        return database;
      } else {
        throw new Error('Supabase REST API connection test failed');
      }
    } catch (supabaseError) {
      logger.warn('Failed to connect to Supabase REST API, using mock database', {
        prismaError: prismaError.message,
        supabaseError: supabaseError.message
      });

      // Fallback to mock database
      database = new MockDatabase();
      connectionType = 'mock';
      logger.info('Using mock database for development/testing');
      return database;
    }
  }
}

/**
 * Returns the current connection type.
 * @returns {'prisma'|'supabase-rest'|'mock'|null}
 */
function getConnectionType() {
  return connectionType;
}

/**
 * Returns true if using the mock database.
 * @returns {boolean}
 */
function isUsingMockDatabase() {
  return connectionType === 'mock';
}

/**
 * Returns true if using Supabase REST API.
 * @returns {boolean}
 */
function isUsingSupabaseREST() {
  return connectionType === 'supabase-rest';
}

/**
 * Returns true if using Prisma.
 * @returns {boolean}
 */
function isUsingPrisma() {
  return connectionType === 'prisma';
}

module.exports = {
  getDatabase,
  getConnectionType,
  isUsingMockDatabase,
  isUsingSupabaseREST,
  isUsingPrisma
};