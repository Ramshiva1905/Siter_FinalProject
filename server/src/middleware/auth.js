const jwt = require('jsonwebtoken');
const { PrismaClient } = require('@prisma/client');
const logger = require('../utils/logger');

const prisma = new PrismaClient();

const authenticateToken = async (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) {
      logger.warn('Authentication failed: No token provided');
      return res.status(401).json({ error: 'Access token required' });
    }

    logger.info(`Verifying token for ${req.method} ${req.path}`);
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    logger.info(`Token decoded successfully for user: ${decoded.userId}`);
    
    // Get user from database
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        accountType: true,
        isEmailVerified: true,
        twoFactorEnabled: true
      }
    });

    if (!user) {
      logger.warn(`Authentication failed: User not found for ID ${decoded.userId}`);
      return res.status(401).json({ error: 'User not found' });
    }

    logger.info(`Authentication successful for user: ${user.email}`);
    req.user = user;
    next();
  } catch (error) {
    logger.error('Authentication error:', error.message);
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ error: 'Invalid token format' });
    } else if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ error: 'Token has expired' });
    } else {
      return res.status(403).json({ error: 'Invalid or expired token' });
    }
  }
};

const requireAdmin = (req, res, next) => {
  if (req.user.accountType !== 'ADMINISTRATOR') {
    return res.status(403).json({ error: 'Administrator access required' });
  }
  next();
};

const requireRegisteredUser = (req, res, next) => {
  if (req.user.accountType === 'GUEST') {
    return res.status(403).json({ error: 'Account registration required' });
  }
  next();
};

// Optional authentication - sets req.user if token is present, but doesn't fail if missing
const optionalAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) {
      // No token provided, continue without authentication
      req.user = null;
      return next();
    }

    logger.info(`Optional auth: Verifying token for ${req.method} ${req.path}`);
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    logger.info(`Optional auth: Token decoded successfully for user: ${decoded.userId}`);
    
    // Get user from database
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        accountType: true,
        isEmailVerified: true,
        twoFactorEnabled: true
      }
    });

    if (!user) {
      logger.warn(`Optional auth: User not found for ID ${decoded.userId}`);
      req.user = null;
    } else {
      logger.info(`Optional auth: Authentication successful for user: ${user.email}`);
      req.user = user;
    }

    next();
  } catch (error) {
    logger.error('Optional auth error:', error.message);
    // For optional auth, we don't fail on token errors - just set user to null
    req.user = null;
    next();
  }
};

module.exports = {
  authenticateToken,
  requireAdmin,
  requireRegisteredUser,
  optionalAuth
};
