const express = require('express');
const bcrypt = require('bcryptjs');
const { body, param, validationResult } = require('express-validator');
const { PrismaClient } = require('@prisma/client');
const { authenticateToken, requireAdmin } = require('../middleware/auth');
const logger = require('../utils/logger');

const router = express.Router();
const prisma = new PrismaClient();

// Validation rules
const updateAccountValidation = [
  param('account_id').isLength({ min: 1 }),
  body('firstName').optional().isLength({ min: 1 }).withMessage('First name cannot be empty'),
  body('lastName').optional().isLength({ min: 1 }).withMessage('Last name cannot be empty'),
  body('dateOfBirth').optional().isISO8601(),
  body('countryOfResidence').optional().isLength({ min: 1 }),
  body('zipCode').optional().isLength({ min: 1 }),
  body('contactNumber').optional().isLength({ min: 1 }),
  body('password').optional().isLength({ min: 8 }).withMessage('Password must be at least 8 characters')
];

const createAccountValidation = [
  body('email').isEmail().normalizeEmail(),
  body('firstName').optional().isLength({ min: 1 }),
  body('lastName').optional().isLength({ min: 1 }),
  body('accountType').optional().isIn(['GUEST', 'REGISTERED_USER', 'ADMINISTRATOR']),
  body('password').optional().isLength({ min: 8 }).withMessage('Password must be at least 8 characters')
];

// Get all users (Admin only)
router.get('/', authenticateToken, requireAdmin, async (req, res, next) => {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        accountType: true,
        isEmailVerified: true,
        twoFactorEnabled: true,
        createdAt: true,
        updatedAt: true
      },
      orderBy: { createdAt: 'desc' }
    });

    res.json(users);
  } catch (error) {
    next(error);
  }
});

// Get account information
router.get('/:account_id', authenticateToken, async (req, res, next) => {
  try {
    const accountId = req.params.account_id;

    // Users can only access their own account, admins can access any
    if (req.user.accountType !== 'ADMINISTRATOR' && req.user.id !== accountId) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const user = await prisma.user.findUnique({
      where: { id: accountId },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        dateOfBirth: true,
        
        
        
        accountType: true,
        isEmailVerified: true,
        twoFactorEnabled: true,
        createdAt: true,
        updatedAt: true
      }
    });

    if (!user) {
      return res.status(404).json({ error: 'Account not found' });
    }

    res.json(user);
  } catch (error) {
    next(error);
  }
});

// Update account information
router.put('/:account_id', authenticateToken, updateAccountValidation, async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ error: 'Validation failed', details: errors.array() });
    }

    const accountId = req.params.account_id;

    // Users can only update their own account, admins can update any
    if (req.user.accountType !== 'ADMINISTRATOR' && req.user.id !== accountId) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const {
      firstName,
      lastName,
      dateOfBirth,
      countryOfResidence,
      zipCode,
      contactNumber,
      password
    } = req.body;

    // Prepare update data
    const updateData = {};
    
    if (firstName !== undefined) updateData.firstName = firstName;
    if (lastName !== undefined) updateData.lastName = lastName;
    if (dateOfBirth !== undefined) updateData.dateOfBirth = dateOfBirth ? new Date(dateOfBirth) : null;
    if (countryOfResidence !== undefined) updateData.countryOfResidence = countryOfResidence;
    if (zipCode !== undefined) updateData.zipCode = zipCode;
    if (contactNumber !== undefined) updateData.contactNumber = contactNumber;

    // Handle password update
    if (password) {
      updateData.password = await bcrypt.hash(password, 12);
    }

    const updatedUser = await prisma.user.update({
      where: { id: accountId },
      data: updateData,
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        dateOfBirth: true,
        
        
        
        accountType: true,
        isEmailVerified: true,
        twoFactorEnabled: true,
        updatedAt: true
      }
    });

    logger.info(`Account updated: ${updatedUser.email} by ${req.user.email}`);

    res.json(updatedUser);
  } catch (error) {
    next(error);
  }
});

// Create account (admin only or guest upgrade)
router.post('/', createAccountValidation, async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ error: 'Validation failed', details: errors.array() });
    }

    const { email, firstName, lastName, accountType, password } = req.body;

    // Check if this is a guest user upgrade or admin creating account
    const isGuestUpgrade = req.query.upgrade === 'true';
    const isAdmin = req.user?.accountType === 'ADMINISTRATOR';

    if (!isGuestUpgrade && !isAdmin) {
      return res.status(403).json({ error: 'Only administrators can create accounts directly' });
    }

    // For guest upgrades, find the guest user
    if (isGuestUpgrade) {
      if (!password) {
        return res.status(400).json({ error: 'Password is required for account upgrade' });
      }

      const guestUser = await prisma.user.findUnique({
        where: { email }
      });

      if (!guestUser || guestUser.accountType !== 'GUEST') {
        return res.status(404).json({ error: 'Guest user not found' });
      }

      // Hash the password
      const passwordHash = await bcrypt.hash(password, 12);

      // Upgrade guest to registered user
      const updatedUser = await prisma.user.update({
        where: { id: guestUser.id },
        data: {
          firstName,
          lastName,
          password: passwordHash, // Use 'password' field as per schema
          accountType: 'REGISTERED_USER',
          // Don't require email verification for guest upgrades since they already received emails
          isEmailVerified: true
        },
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          accountType: true,
          isEmailVerified: true,
          createdAt: true
        }
      });

      logger.info(`Guest user upgraded: ${updatedUser.email}`);
      return res.status(201).json(updatedUser);
    }

    // Admin creating new account
    const newUser = await prisma.user.create({
      data: {
        email,
        firstName,
        lastName,
        accountType: accountType || 'REGISTERED_USER',
        isEmailVerified: false // Will need to verify email
      },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        accountType: true,
        isEmailVerified: true,
        createdAt: true
      }
    });

    logger.info(`Account created by admin: ${newUser.email}`);

    res.status(201).json(newUser);
  } catch (error) {
    next(error);
  }
});

// Delete account (admin only)
router.delete('/:account_id', authenticateToken, requireAdmin, async (req, res, next) => {
  try {
    const accountId = req.params.account_id;

    // Prevent admin from deleting their own account
    if (req.user.id === accountId) {
      return res.status(400).json({ error: 'Cannot delete your own account' });
    }

    const user = await prisma.user.findUnique({
      where: { id: accountId }
    });

    if (!user) {
      return res.status(404).json({ error: 'Account not found' });
    }

    await prisma.user.delete({
      where: { id: accountId }
    });

    logger.info(`Account deleted: ${user.email} by admin: ${req.user.email}`);

    res.json({ message: 'Account deleted successfully' });
  } catch (error) {
    next(error);
  }
});

// Get current user profile (shortcut endpoint)
router.get('/me/profile', authenticateToken, async (req, res, next) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        dateOfBirth: true,
        accountType: true,
        isEmailVerified: true,
        twoFactorEnabled: true,
        createdAt: true,
        updatedAt: true
      }
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json(user);
  } catch (error) {
    next(error);
  }
});

module.exports = router;
