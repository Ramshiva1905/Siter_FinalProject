// Test setup file
require('dotenv').config({ path: '.env.test' });

// Mock email sending in tests
jest.mock('../utils/email', () => ({
  sendVerificationEmail: jest.fn().mockResolvedValue(true),
  sendWelcomeEmail: jest.fn().mockResolvedValue(true),
  sendShipmentReceiptEmail: jest.fn().mockResolvedValue(true)
}));

// Mock logger in tests
jest.mock('../utils/logger', () => ({
  info: jest.fn(),
  error: jest.fn(),
  warn: jest.fn(),
  debug: jest.fn()
}));
