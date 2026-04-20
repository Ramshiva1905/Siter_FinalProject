const express = require('express');
const { body, param, query, validationResult } = require('express-validator');
const { getDatabase, getConnectionType } = require('../utils/databaseConnection');
const { getTempPrisma } = require('../utils/tempPrisma');
const { authenticateToken, requireAdmin, optionalAuth } = require('../middleware/auth');
const { calculateShippingCost } = require('../utils/shipping');
const { sendShipmentReceiptEmail } = require('../utils/email');
const logger = require('../utils/logger');

const router = express.Router();

// Temporary compatibility layer - TODO: Remove when all routes updated
const prisma = {
  shipment: {
    findMany: async (...args) => {    // Return shipment details for claiming
    res.json({
      id: shipment.id,
      receiverName: shipment.recipientName, // Map from schema field to frontend field
      weight: shipment.weight,
      boxColor: shipment.boxColor,
      totalCost: shipment.totalCost,
      status: shipment.statusHistory && shipment.statusHistory.length > 0 
        ? shipment.statusHistory[0].status 
        : 'CREATED',
      createdAt: shipment.createdAt,
      destinationCountry: shipment.destinationCountry,
      guestEmail: shipment.user?.email
    });b = await getDatabase();
      return db.shipment.findMany(...args);
    },
    findUnique: async (...args) => {
      const db = await getDatabase();
      return db.shipment.findUnique(...args);
    },
    create: async (...args) => {
      const db = await getDatabase();
      return db.shipment.create(...args);
    },
    delete: async (...args) => {
      const db = await getDatabase();
      return db.shipment.delete(...args);
    }
  },
  statusHistory: {
    create: async (...args) => {
      const db = await getDatabase();
      return db.statusHistory.create(...args);
    }
  }
};

// Validation rules
const createShipmentValidation = [
  body('receiverName').isLength({ min: 1 }).withMessage('Receiver name is required'),
  body('weight').isIn(['1', '2', '5', '8']).withMessage('Weight must be 1, 2, 5, or 8 kg'),
  body('boxColor').matches(/^rgba?\(\d+,\s*\d+,\s*\d+(,\s*[01]?\.?\d*)?\)$/).withMessage('Invalid RGBA color format'),
  body('countryId').isLength({ min: 1 }).withMessage('Valid country ID required'),
  body('guestEmail').optional().isEmail().normalizeEmail()
];

const updateShipmentValidation = [
  param('shipment_id').isLength({ min: 1 }).withMessage('Valid shipment ID required'),
  body('status').optional().isIn(['CREATED', 'RECEIVED', 'IN_TRANSIT', 'DELIVERED', 'CANCELLED']),
  body('notes').optional().isString()
];

// Get shipments for authenticated user
router.get('/', authenticateToken, async (req, res, next) => {
  try {
    const { status, from, to } = req.query;
    const userId = req.user.accountType === 'ADMINISTRATOR' ? undefined : req.user.id;

    const whereClause = {
      ...(userId && { userId }),
      ...(status && {
        statusHistory: {
          some: {
            status
          }
        }
      }),
      ...(from && { createdAt: { gte: new Date(from) } }),
      ...(to && { createdAt: { lte: new Date(to) } })
    };

    const db = await getDatabase();
    const connectionType = getConnectionType();

    let shipments = [];
    
    if (connectionType === 'prisma') {
      try {
        shipments = await db.shipment.findMany({
          where: whereClause,
          include: {
            user: {
              select: {
                id: true,
                email: true,
                firstName: true,
                lastName: true,
                accountType: true
              }
            },
            destinationCountry: true,
            statusHistory: {
              orderBy: { createdAt: 'desc' },
              take: 1
            }
          },
          orderBy: { createdAt: 'desc' }
        });
      } catch (prismaError) {
        logger.error('Prisma connection failed for main shipments route, falling back to empty array', { error: prismaError.message });
        shipments = []; // Return empty array instead of crashing
      }
    } else {
      shipments = await db.getShipments();
      // Filter by user if not admin
      if (userId) {
        shipments = shipments.filter(s => s.userId === userId);
      }
    }

    // Filter out completed and cancelled for admin view
    const filteredShipments = req.user.accountType === 'ADMINISTRATOR' 
      ? shipments.filter(s => {
          const latestStatus = s.statusHistory[0]?.status;
          return latestStatus !== 'DELIVERED' && latestStatus !== 'CANCELLED';
        })
      : shipments;

    res.json(filteredShipments);
  } catch (error) {
    next(error);
  }
});

// Helper function to get shipment IDs
async function getShipmentIds() {
  const db = await getDatabase();
  const connectionType = getConnectionType();
  
  if (connectionType === 'prisma') {
    const shipments = await db.shipment.findMany({ select: { id: true } });
    return shipments.map(s => s.id);
  } else {
    const shipments = await db.getShipments();
    return shipments.map(s => s.id);
  }
}

// Get completed shipments
router.get('/complete', authenticateToken, async (req, res, next) => {
  try {
    const userId = req.user.accountType === 'ADMINISTRATOR' ? undefined : req.user.id;
    const db = await getDatabase();
    const connectionType = getConnectionType();

    let shipments = [];
    
    if (connectionType === 'prisma') {
      try {
        shipments = await db.shipment.findMany({
          where: {
            ...(userId && { userId }),
            statusHistory: {
              some: {
                status: 'DELIVERED'
              }
            }
          },
          include: {
            user: {
              select: {
                id: true,
                email: true,
                firstName: true,
                lastName: true,
                accountType: true
              }
            },
            destinationCountry: true,
            statusHistory: {
              orderBy: { createdAt: 'desc' }
            }
          },
          orderBy: { createdAt: 'desc' }
        });
      } catch (prismaError) {
        logger.error('Prisma connection failed for /complete, falling back to empty array', { error: prismaError.message });
        shipments = []; // Return empty array instead of crashing
      }
    } else {
      // Get all shipments and filter for delivered ones
      const allShipments = await db.getShipments();
      shipments = allShipments.filter(s => {
        // Filter by user if not admin
        if (userId && s.userId !== userId) return false;
        // Check if latest status is DELIVERED
        return s.statusHistory?.[0]?.status === 'DELIVERED';
      });
    }

    res.json(shipments);
  } catch (error) {
    next(error);
  }
});

// Get cancelled shipments
router.get('/cancelled', authenticateToken, async (req, res, next) => {
  try {
    const userId = req.user.accountType === 'ADMINISTRATOR' ? undefined : req.user.id;

    const shipments = await prisma.shipment.findMany({
      where: {
        ...(userId && { userId }),
        statusHistory: {
          some: {
            status: 'CANCELLED'
          }
        }
      },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
            accountType: true
          }
        },
        destinationCountry: true,
        statusHistory: {
          orderBy: { createdAt: 'desc' }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    res.json(shipments);
  } catch (error) {
    next(error);
  }
});

// Create new shipment
router.post('/', optionalAuth, createShipmentValidation, async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ error: 'Validation failed', details: errors.array() });
    }

    const { receiverName, weight, boxColor, countryId, guestEmail } = req.body;
    let userId = req.user?.id;

    // Get database connection
    const db = await getDatabase();
    const connectionType = getConnectionType();
    
    // Handle guest user creation
    if (!userId && guestEmail) {
      let guestUser;
      
      if (connectionType === 'prisma') {
        // Create or find guest user
        guestUser = await db.user.findUnique({
          where: { email: guestEmail }
        });

        if (!guestUser) {
          try {
            guestUser = await db.user.create({
              data: {
                email: guestEmail,
                accountType: 'GUEST',
                isEmailVerified: true // Guests don't need email verification for shipments
              }
            });
          } catch (createError) {
            // Handle unique constraint violation (another request created the same user)
            if (createError.code === 'P2002') {
              // Try to find the user again
              guestUser = await db.user.findUnique({
                where: { email: guestEmail }
              });
              if (!guestUser) {
                throw new Error('Failed to create or find guest user');
              }
            } else {
              throw createError;
            }
          }
        }
      } else {
        // Use adapter method for non-Prisma connections
        const existingUsers = await db.getUsers();
        guestUser = existingUsers.find(u => u.email === guestEmail);
        
        if (!guestUser) {
          guestUser = await db.createUser({
            email: guestEmail,
            accountType: 'GUEST',
            isEmailVerified: true
          });
        }
      }
      userId = guestUser.id;
    } else if (!userId) {
      return res.status(401).json({ error: 'Authentication required or guest email must be provided' });
    }

    // Get country information
    let country;
    if (connectionType === 'prisma') {
      // Handle both string and integer IDs
      const searchId = isNaN(countryId) ? countryId : parseInt(countryId);
      country = await db.country.findUnique({
        where: { id: searchId }
      });
    } else {
      const countries = await db.getCountries();
      country = countries.find(c => c.id === countryId || c.id === parseInt(countryId));
    }

    if (!country || !country.isActive) {
      logger.error('Country lookup failed', { 
        countryId, 
        countryFound: !!country,
        countryActive: country?.isActive 
      });
      return res.status(400).json({ error: 'Invalid or inactive country' });
    }

    logger.info('Country found for shipment', {
      countryId: country.id,
      countryName: country.name,
      multiplier: country.multiplier
    });

    // Calculate shipping cost
    const weightNum = parseFloat(weight);
    const multiplierNum = parseFloat(country.multiplier);
    
    logger.info('Calculating shipping cost', {
      weight: weightNum,
      multiplier: multiplierNum,
      country: country.name
    });
    
    const totalCost = calculateShippingCost(weightNum, multiplierNum);

    // Create shipment
    let shipment;
    if (connectionType === 'prisma') {
      shipment = await db.shipment.create({
        data: {
          recipientName: receiverName,
          recipientEmail: guestEmail || req.user?.email || 'unknown@example.com',
          recipientPhone: '', // Default empty
          recipientAddress: '', // Default empty  
          weight: parseFloat(weight),
          length: 1.0, // Default dimensions for mystery box
          width: 1.0,
          height: 1.0,
          boxColor,
          totalCost,
          userId,
          destinationCountryId: countryId
        },
        include: {
          user: true,
          destinationCountry: true
        }
      });

      // Create initial status
      await db.statusHistory.create({
        data: {
          shipmentId: shipment.id,
          status: 'CREATED',
          notes: 'Shipment created'
        }
      });
    } else {
      // Use adapter method for non-Prisma connections
      shipment = await db.createShipment({
        recipientName: receiverName,
        recipientEmail: guestEmail || req.user?.email || 'unknown@example.com',
        weight: parseFloat(weight),
        boxColor,
        totalCost,
        userId,
        destinationCountryId: countryId
      });
    }

    // Send receipt email (but don't fail shipment creation if email fails)
    try {
      if (guestEmail || req.user?.email) {
        await sendShipmentReceiptEmail(
          guestEmail || req.user.email,
          shipment,
          !!guestEmail // isGuest
        );
      }
    } catch (emailError) {
      logger.warn('Failed to send receipt email', { 
        error: emailError.message,
        shipmentId: shipment.id 
      });
      // Don't fail the shipment creation for email issues
    }

    logger.info(`Shipment created: ${shipment.id} for user: ${shipment.user?.email || guestEmail}`);

    res.status(201).json(shipment);
  } catch (error) {
    logger.error('Error creating shipment', { 
      error: error.message,
      stack: error.stack,
      body: req.body 
    });
    next(error);
  }
});

// Get single shipment
router.get('/:shipment_id', authenticateToken, async (req, res, next) => {
  try {
    const shipmentId = req.params.shipment_id; // Keep as string for CUID

    const db = await getDatabase();
    const connectionType = getConnectionType();

    let shipment = null;

    if (connectionType === 'prisma') {
      shipment = await db.shipment.findUnique({
        where: { id: shipmentId },
        include: {
          user: {
            select: {
              id: true,
              email: true,
              firstName: true,
              lastName: true,
              accountType: true
            }
          },
          destinationCountry: true,
          statusHistory: {
            orderBy: { createdAt: 'desc' }
          }
        }
      });
    } else {
      // For REST API - get all shipments and find the one we need
      const allShipments = await db.getShipments();
      shipment = allShipments.find(s => s.id === shipmentId);
    }

    if (!shipment) {
      return res.status(404).json({ error: 'Shipment not found' });
    }

    // Check if user has access to this shipment
    if (req.user.accountType !== 'ADMINISTRATOR' && shipment.userId !== req.user.id) {
      return res.status(403).json({ error: 'Access denied' });
    }

    res.json(shipment);
  } catch (error) {
    next(error);
  }
});

// Get shipments by customer
router.get('/customer/:customer_id', authenticateToken, requireAdmin, async (req, res, next) => {
  try {
    const customerId = req.params.customer_id; // Keep as string for CUID

    const db = await getDatabase();
    const connectionType = getConnectionType();

    let shipments = [];

    if (connectionType === 'prisma') {
      shipments = await db.shipment.findMany({
        where: { userId: customerId },
        include: {
          user: {
            select: {
              id: true,
              email: true,
              firstName: true,
              lastName: true,
              accountType: true
            }
          },
          destinationCountry: true,
          statusHistory: {
            orderBy: { createdAt: 'desc' }
          }
        },
        orderBy: { createdAt: 'desc' }
      });
    } else {
      // For REST API - get all shipments and filter by user
      const allShipments = await db.getShipments();
      shipments = allShipments.filter(s => s.userId === customerId);
    }

    res.json(shipments);
  } catch (error) {
    next(error);
  }
});

// Update shipment
router.put('/:shipment_id', authenticateToken, updateShipmentValidation, async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      logger.error('Shipment update validation failed', { 
        errors: errors.array(), 
        body: req.body, 
        params: req.params 
      });
      return res.status(400).json({ error: 'Validation failed', details: errors.array() });
    }

    logger.info(`Processing shipment update for ID: ${req.params.shipment_id}`, {
      body: req.body,
      user: req.user.email
    });

    const shipmentId = req.params.shipment_id; // Keep as string for CUID
    const { status, notes } = req.body;

    const db = await getDatabase();
    const connectionType = getConnectionType();

    let shipment = null;

    if (connectionType === 'prisma') {
      shipment = await db.shipment.findUnique({
        where: { id: shipmentId },
        include: { user: true }
      });
    } else {
      // For REST API - get all shipments and find the one we need
      const allShipments = await db.getShipments();
      shipment = allShipments.find(s => s.id === shipmentId);
    }

    if (!shipment) {
      return res.status(404).json({ error: 'Shipment not found' });
    }

    // Check permissions
    if (req.user.accountType !== 'ADMINISTRATOR' && shipment.userId !== req.user.id) {
      return res.status(403).json({ error: 'Access denied' });
    }

    // Non-admin users can only cancel shipments
    if (req.user.accountType !== 'ADMINISTRATOR' && status && status !== 'CANCELLED') {
      return res.status(403).json({ error: 'Only administrators can change shipment status' });
    }

    // If status is being updated, update the shipment and create a new status record
    if (status) {
      if (connectionType === 'prisma') {
        // Update the shipment status
        await db.shipment.update({
          where: { id: shipmentId },
          data: { status }
        });

        // Create status history record
        await db.statusHistory.create({
          data: {
            shipmentId,
            status,
            notes: notes || `Status changed to ${status}`
          }
        });
      } else {
        // For REST API - update shipment via adapter
        await db.updateShipment(shipmentId, { status });
        
        // Create status history record
        await db.statusHistory.create({
          data: {
            shipmentId,
            status,
            notes: notes || `Status changed to ${status}`,
            createdAt: new Date().toISOString()
          }
        });
      }

      logger.info(`Shipment ${shipmentId} status changed to ${status} by ${req.user.email}`);
    }

    let updatedShipment = null;

    if (connectionType === 'prisma') {
      updatedShipment = await db.shipment.findUnique({
        where: { id: shipmentId },
        include: {
          user: {
            select: {
              id: true,
              email: true,
              firstName: true,
              lastName: true,
              accountType: true
            }
          },
          destinationCountry: true,
          statusHistory: {
            orderBy: { createdAt: 'desc' }
          }
        }
      });
    } else {
      // For REST API - get updated shipment data
      const allShipments = await db.getShipments();
      updatedShipment = allShipments.find(s => s.id === shipmentId);
    }

    res.json(updatedShipment);
  } catch (error) {
    next(error);
  }
});

// Delete shipment (admin only)
router.delete('/:shipment_id', authenticateToken, requireAdmin, async (req, res, next) => {
  try {
    const shipmentId = req.params.shipment_id; // Keep as string for CUID

    const db = await getDatabase();
    const connectionType = getConnectionType();

    let shipment = null;

    if (connectionType === 'prisma') {
      shipment = await db.shipment.findUnique({
        where: { id: shipmentId }
      });

      if (!shipment) {
        return res.status(404).json({ error: 'Shipment not found' });
      }

      await db.shipment.delete({
        where: { id: shipmentId }
      });
    } else {
      // For REST API - get all shipments and find the one we need
      const allShipments = await db.getShipments();
      shipment = allShipments.find(s => s.id === shipmentId);

      if (!shipment) {
        return res.status(404).json({ error: 'Shipment not found' });
      }

      // Delete via REST API
      await db.deleteShipment(shipmentId);
    }

    logger.info(`Shipment ${shipmentId} deleted by admin: ${req.user.email}`);

    res.json({ message: 'Shipment deleted successfully' });
  } catch (error) {
    next(error);
  }
});

// Get shipment for claiming (guest access)
router.get('/claim/:shipment_id', async (req, res, next) => {
  try {
    const shipmentId = req.params.shipment_id;

    const db = await getDatabase();
    const connectionType = getConnectionType();

    let shipment = null;

    if (connectionType === 'prisma') {
      shipment = await db.shipment.findUnique({
        where: { id: shipmentId },
        include: {
          user: {
            select: {
              id: true,
              email: true,
              firstName: true,
              lastName: true,
              accountType: true
            }
          },
          destinationCountry: true,
          statusHistory: {
            orderBy: { createdAt: 'desc' }
          }
        }
      });
    } else {
      // For REST API - get all shipments and find the one we need
      const allShipments = await db.getShipments();
      shipment = allShipments.find(s => s.id === shipmentId);
    }

    if (!shipment) {
      return res.status(404).json({ error: 'Shipment not found' });
    }

    // Only allow claiming for guest users
    if (shipment.user?.accountType !== 'GUEST') {
      return res.status(400).json({ 
        error: 'This shipment cannot be claimed. It belongs to a registered user.' 
      });
    }

    // Return shipment details for claiming
    res.json({
      id: shipment.id,
      receiverName: shipment.recipientName, // Map schema field to frontend expectation
      weight: shipment.weight,
      boxColor: shipment.boxColor,
      totalCost: shipment.totalCost,
      status: shipment.statusHistory && shipment.statusHistory.length > 0 
        ? shipment.statusHistory[0].status 
        : 'CREATED',
      createdAt: shipment.createdAt,
      destinationCountry: shipment.destinationCountry,
      guestEmail: shipment.user?.email
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
