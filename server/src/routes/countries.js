const express = require('express');
const { getDatabase, getConnectionType } = require('../utils/databaseConnection');
const logger = require('../utils/logger');

const router = express.Router();

/**
 * GET /api/countries
 * Retrieve all countries with their multipliers
 */
router.get('/', async (req, res, next) => {
  try {
    const { active } = req.query;
    const db = await getDatabase();
    const connectionType = getConnectionType();
    let countries = [];
    
    logger.info(`Fetching countries using ${connectionType} connection`);
    
    if (connectionType === 'prisma') {
      const whereClause = active === 'true' ? { isActive: true } : {};
      countries = await db.country.findMany({
        where: whereClause,
        select: {
          id: true,
          name: true,
          multiplier: true,
          isActive: true
        },
        orderBy: { name: 'asc' }
      });
    } else {
      // Supabase REST or Mock
      countries = await db.getCountries();
      if (active === 'true') {
        countries = countries.filter(c => c.isActive);
      }
    }
    
    logger.info(`Successfully retrieved ${countries.length} countries`);
    res.json(countries);
    
  } catch (error) {
    logger.error('Failed to fetch countries', { 
      error: error.message,
      stack: error.stack 
    });
    next(error);
  }
});

/**
 * GET /api/countries/:id
 * Retrieve a specific country by ID
 */
router.get('/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    const db = await getDatabase();
    const connectionType = getConnectionType();
    let country = null;
    
    if (connectionType === 'prisma') {
      country = await db.country.findUnique({
        where: { id: parseInt(id) },
        select: {
          id: true,
          name: true,
          multiplier: true,
          isActive: true
        }
      });
    } else {
      const countries = await db.getCountries();
      country = countries.find(c => c.id === parseInt(id));
    }
    
    if (!country) {
      return res.status(404).json({ error: 'Country not found' });
    }
    
    res.json(country);
    
  } catch (error) {
    logger.error('Failed to fetch country', { 
      id: req.params.id,
      error: error.message 
    });
    next(error);
  }
});

/**
 * PUT /api/countries/:id
 * Update country multiplier (Admin only)
 */
router.put('/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    const { multiplier, isActive } = req.body;
    
    const db = await getDatabase();
    const connectionType = getConnectionType();
    
    logger.info(`Updating country ${id} using ${connectionType} connection`);
    
    let updatedCountry;
    
    if (connectionType === 'prisma') {
      updatedCountry = await db.country.update({
        where: { id },
        data: {
          ...(multiplier !== undefined && { multiplier: parseFloat(multiplier) }),
          ...(isActive !== undefined && { isActive: Boolean(isActive) })
        },
        select: {
          id: true,
          name: true,
          multiplier: true,
          isActive: true
        }
      });
    } else {
      // For adapter implementations
      updatedCountry = await db.updateCountry(id, {
        multiplier: multiplier !== undefined ? parseFloat(multiplier) : undefined,
        isActive: isActive !== undefined ? Boolean(isActive) : undefined
      });
    }
    
    logger.info(`Successfully updated country: ${updatedCountry.name}`);
    res.json(updatedCountry);
    
  } catch (error) {
    logger.error('Failed to update country', { 
      id: req.params.id,
      error: error.message 
    });
    next(error);
  }
});

module.exports = router;
