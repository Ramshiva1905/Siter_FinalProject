const express = require('express');
const { body, param, validationResult } = require('express-validator');
const { PrismaClient } = require('@prisma/client');
const { authenticateToken, requireAdmin } = require('../middleware/auth');
const logger = require('../utils/logger');

const router = express.Router();
const prisma = new PrismaClient();

// Validation rules
const updateCountryValidation = [
  param('country_id').isLength({ min: 1 }),
  body('name').optional().isLength({ min: 1 }).withMessage('Country name is required'),
  body('code').optional().isLength({ min: 2, max: 3 }).withMessage('Country code must be 2-3 characters'),
  body('multiplier').optional().isFloat({ min: 0 }).withMessage('Multiplier must be a positive number'),
  body('isActive').optional().isBoolean()
];

const createCountryValidation = [
  body('name').isLength({ min: 1 }).withMessage('Country name is required'),
  body('code').isLength({ min: 2, max: 3 }).withMessage('Country code must be 2-3 characters'),
  body('multiplier').isFloat({ min: 0 }).withMessage('Multiplier must be a positive number'),
  body('isActive').optional().isBoolean()
];

// Get all countries with their multipliers
router.get('/countries', async (req, res, next) => {
  try {
    const { active } = req.query;
    
    const countries = await prisma.country.findMany({
      where: {
        ...(active === 'true' && { isActive: true })
      },
      orderBy: { name: 'asc' }
    });

    res.json(countries);
  } catch (error) {
    next(error);
  }
});

// Get single country
router.get('/countries/:country_id', async (req, res, next) => {
  try {
    const countryId = req.params.country_id;

    const country = await prisma.country.findUnique({
      where: { id: countryId }
    });

    if (!country) {
      return res.status(404).json({ error: 'Country not found' });
    }

    res.json(country);
  } catch (error) {
    next(error);
  }
});

// Create new country (admin only)
router.post('/countries', authenticateToken, requireAdmin, createCountryValidation, async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ error: 'Validation failed', details: errors.array() });
    }

    const { name, code, multiplier, isActive = true } = req.body;

    const country = await prisma.country.create({
      data: {
        name,
        code: code.toUpperCase(),
        multiplier: parseFloat(multiplier),
        isActive
      }
    });

    logger.info(`Country created: ${country.name} by admin: ${req.user.email}`);

    res.status(201).json(country);
  } catch (error) {
    next(error);
  }
});

// Update country (admin only)
router.put('/countries/:country_id', authenticateToken, requireAdmin, updateCountryValidation, async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ error: 'Validation failed', details: errors.array() });
    }

    const countryId = req.params.country_id;
    const { name, code, multiplier, isActive } = req.body;

    // Check if country exists
    const existingCountry = await prisma.country.findUnique({
      where: { id: countryId }
    });

    if (!existingCountry) {
      return res.status(404).json({ error: 'Country not found' });
    }

    // Prepare update data
    const updateData = {};
    if (name !== undefined) updateData.name = name;
    if (code !== undefined) updateData.code = code.toUpperCase();
    if (multiplier !== undefined) updateData.multiplier = parseFloat(multiplier);
    if (isActive !== undefined) updateData.isActive = isActive;

    const updatedCountry = await prisma.country.update({
      where: { id: countryId },
      data: updateData
    });

    logger.info(`Country updated: ${updatedCountry.name} by admin: ${req.user.email}`);

    res.json(updatedCountry);
  } catch (error) {
    next(error);
  }
});

// Delete country (admin only)
router.delete('/countries/:country_id', authenticateToken, requireAdmin, async (req, res, next) => {
  try {
    const countryId = req.params.country_id;

    // Check if country exists
    const country = await prisma.country.findUnique({
      where: { id: countryId },
      include: {
        shipments: true
      }
    });

    if (!country) {
      return res.status(404).json({ error: 'Country not found' });
    }

    // Check if country has shipments
    if (country.shipments.length > 0) {
      return res.status(400).json({ 
        error: 'Cannot delete country with existing shipments. Consider deactivating instead.' 
      });
    }

    await prisma.country.delete({
      where: { id: countryId }
    });

    logger.info(`Country deleted: ${country.name} by admin: ${req.user.email}`);

    res.json({ message: 'Country deleted successfully' });
  } catch (error) {
    next(error);
  }
});

// Get shipping statistics (admin only)
router.get('/statistics', authenticateToken, requireAdmin, async (req, res, next) => {
  try {
    const { from, to } = req.query;
    
    const dateFilter = {};
    if (from) dateFilter.gte = new Date(from);
    if (to) dateFilter.lte = new Date(to);

    // Get shipment counts by status
    const statusCounts = await prisma.shipmentStatus.groupBy({
      by: ['status'],
      _count: {
        id: true
      },
      where: {
        ...(Object.keys(dateFilter).length > 0 && {
          createdAt: dateFilter
        })
      }
    });

    // Get shipment counts by country
    const countryCounts = await prisma.shipment.groupBy({
      by: ['countryId'],
      _count: {
        id: true
      },
      _sum: {
        totalCost: true
      },
      where: {
        ...(Object.keys(dateFilter).length > 0 && {
          createdAt: dateFilter
        })
      }
    });

    // Get country details for the counts
    const countries = await prisma.country.findMany({
      where: {
        id: {
          in: countryCounts.map(c => c.countryId)
        }
      }
    });

    const countryStats = countryCounts.map(stat => ({
      ...stat,
      country: countries.find(c => c.id === stat.countryId)
    }));

    // Get total revenue
    const totalRevenue = await prisma.shipment.aggregate({
      _sum: {
        totalCost: true
      },
      where: {
        ...(Object.keys(dateFilter).length > 0 && {
          createdAt: dateFilter
        })
      }
    });

    // Get user statistics
    const userStats = await prisma.user.groupBy({
      by: ['accountType'],
      _count: {
        id: true
      }
    });

    res.json({
      statusCounts,
      countryStats,
      userStats,
      totalRevenue: totalRevenue._sum.totalCost || 0
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
