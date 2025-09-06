const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const speakeasy = require('speakeasy');
const qrcode = require('qrcode');
const { body, validationResult } = require('express-validator');
const { authLimiter } = require('../middleware/rateLimiter');
const { authenticateToken } = require('../middleware/auth');
const { sendVerificationEmail, sendWelcomeEmail } = require('../utils/email');
const { getDatabase, getConnectionType, isUsingMockDatabase, isUsingSupabaseREST } = require('../utils/databaseConnection');
const logger = require('../utils/logger');

const router = express.Router();
let prisma = null;

// Initialize database connection
(async () => {
  prisma = await getDatabase();
  const connectionType = getConnectionType();
  if (isUsingMockDatabase()) {
    logger.warn('Auth routes using mock database - some features may be limited');
  } else if (isUsingSupabaseREST()) {
    logger.info('Auth routes using Supabase REST API - full functionality available');
  } else {
    logger.info('Auth routes using Prisma direct connection - full functionality available');
  }
})();

// Middleware to ensure database is ready
const ensureDatabaseReady = async (req, res, next) => {
  if (!prisma) {
    prisma = await getDatabase();
  }
  next();
};

// Validation rules
const loginValidation = [
  body('email').isEmail().normalizeEmail(),
  body('password').isLength({ min: 1 }).withMessage('Password is required')
];

const registerValidation = [
  body('email').isEmail().normalizeEmail(),
  body('password').isLength({ min: 8 }).withMessage('Password must be at least 8 characters'),
  body('firstName').isLength({ min: 1 }).withMessage('First name is required'),
  body('lastName').isLength({ min: 1 }).withMessage('Last name is required'),
  body('dateOfBirth').optional().isISO8601(),
  body('countryOfResidence').optional().isLength({ min: 1 }),
  body('zipCode').optional().isLength({ min: 1 }),
  body('contactNumber').optional().isLength({ min: 1 })
];

// Login endpoint
router.post('/login', ensureDatabaseReady, authLimiter, loginValidation, async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ error: 'Validation failed', details: errors.array() });
    }

    const { email, password, twoFactorToken } = req.body;

    // Find user
    const user = await prisma.user.findUnique({
      where: { email }
    });

    if (!user || !user.password) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Verify password
    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Check 2FA if enabled
    if (user.twoFactorEnabled) {
      if (!twoFactorToken) {
        return res.status(200).json({ requiresTwoFactor: true });
      }

      const verified = speakeasy.totp.verify({
        secret: user.twoFactorSecret,
        encoding: 'base32',
        token: twoFactorToken,
        window: 2
      });

      if (!verified) {
        return res.status(401).json({ error: 'Invalid 2FA token' });
      }
    }

    // Generate JWT token
    const token = jwt.sign(
      { userId: user.id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '24h' }
    );

    logger.info(`User logged in: ${user.email}`);

    res.json({
      token,
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        accountType: user.accountType,
        twoFactorEnabled: user.twoFactorEnabled
      }
    });
  } catch (error) {
    next(error);
  }
});

// Register endpoint
router.post('/register', ensureDatabaseReady, authLimiter, registerValidation, async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ error: 'Validation failed', details: errors.array() });
    }

    const {
      email,
      password,
      firstName,
      lastName,
      dateOfBirth,
      countryOfResidence,
      zipCode,
      contactNumber
    } = req.body;

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email }
    });

    if (existingUser) {
      return res.status(409).json({ error: 'User already exists with this email' });
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, 12);

    // Create user with auto-verified email
    const user = await prisma.user.create({
      data: {
        email,
        password: passwordHash,
        firstName,
        lastName,
        dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : null,
        isEmailVerified: true, // Auto-verify email
        accountType: 'REGISTERED_USER'
      }
    });

    // Generate JWT token for immediate login
    const token = jwt.sign(
      { userId: user.id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '24h' }
    );

    // Send welcome email directly
    await sendWelcomeEmail(user.email, user.firstName);

    logger.info(`New user registered with auto-verified email: ${user.email}`);

    res.status(201).json({
      message: 'Registration successful. Your account is ready to use.',
      token,
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        accountType: user.accountType,
        twoFactorEnabled: user.twoFactorEnabled
      }
    });
  } catch (error) {
    next(error);
  }
});

// Email verification endpoint
router.get('/verify-email/:token', async (req, res, next) => {
  try {
    const { token } = req.params;

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    const user = await prisma.user.findFirst({
      where: {
        email: decoded.email,
        emailVerificationToken: token
      }
    });

    if (!user) {
      return res.status(400).json({ error: 'Invalid or expired verification token' });
    }

    await prisma.user.update({
      where: { id: user.id },
      data: {
        isEmailVerified: true,
        emailVerificationToken: null
      }
    });

    await sendWelcomeEmail(user.email, user.firstName);

    logger.info(`Email verified for user: ${user.email}`);

    res.json({ message: 'Email verified successfully' });
  } catch (error) {
    next(error);
  }
});

// Setup 2FA endpoint
router.post('/setup-2fa', authenticateToken, async (req, res, next) => {
  try {
    const secret = speakeasy.generateSecret({
      name: `${process.env.TWO_FA_SERVICE_NAME || 'Boxinator'} (${req.user.email})`,
      issuer: process.env.TWO_FA_ISSUER || 'Boxinator Inc.'
    });

    // Generate QR code
    const qrCodeUrl = await qrcode.toDataURL(secret.otpauth_url);

    // Store secret temporarily (not activated until verified)
    await prisma.user.update({
      where: { id: req.user.id },
      data: { twoFactorSecret: secret.base32 }
    });

    res.json({
      secret: secret.base32,
      qrCode: qrCodeUrl,
      manualEntryKey: secret.base32
    });
  } catch (error) {
    next(error);
  }
});

// Verify and enable 2FA
router.post('/verify-2fa', authenticateToken, async (req, res, next) => {
  try {
    const { token } = req.body;

    if (!token) {
      return res.status(400).json({ error: '2FA token required' });
    }

    const user = await prisma.user.findUnique({
      where: { id: req.user.id }
    });

    if (!user.twoFactorSecret) {
      return res.status(400).json({ error: '2FA setup not initiated' });
    }

    const verified = speakeasy.totp.verify({
      secret: user.twoFactorSecret,
      encoding: 'base32',
      token,
      window: 2
    });

    if (!verified) {
      return res.status(400).json({ error: 'Invalid 2FA token' });
    }

    await prisma.user.update({
      where: { id: req.user.id },
      data: { twoFactorEnabled: true }
    });

    logger.info(`2FA enabled for user: ${user.email}`);

    res.json({ message: '2FA enabled successfully' });
  } catch (error) {
    next(error);
  }
});

// Disable 2FA
router.post('/disable-2fa', authenticateToken, async (req, res, next) => {
  try {
    await prisma.user.update({
      where: { id: req.user.id },
      data: {
        twoFactorEnabled: false,
        twoFactorSecret: null
      }
    });

    logger.info(`2FA disabled for user: ${req.user.email}`);

    res.json({ message: '2FA disabled successfully' });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
