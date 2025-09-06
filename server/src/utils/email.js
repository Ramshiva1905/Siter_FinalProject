const nodemailer = require('nodemailer');
const logger = require('./logger');

// Create transporter
const createTransporter = () => {
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT) || 587,
    secure: false, // true for 465, false for other ports
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });
};

/**
 * Send email verification email
 * @param {string} email - Recipient email
 * @param {string} token - Verification token
 */
const sendVerificationEmail = async (email, token) => {
  try {
    // In development, if SMTP is not configured properly, just log the email
    if (!process.env.SMTP_USER || process.env.SMTP_USER === 'your-email@gmail.com') {
      logger.info(`Email verification would be sent to ${email}`, {
        service: 'email',
        token: token,
        verificationUrl: `${process.env.FRONTEND_URL}/verify-email/${token}`
      });
      return { success: true, message: 'Email skipped in development' };
    }

    const transporter = createTransporter();
    const verificationUrl = `${process.env.FRONTEND_URL}/verify-email/${token}`;

    const mailOptions = {
      from: process.env.FROM_EMAIL,
      to: email,
      subject: 'Verify Your Boxinator Account',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #333;">Welcome to Boxinator!</h2>
          <p>Thank you for registering with Boxinator. Please verify your email address by clicking the button below:</p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${verificationUrl}" style="background-color: #007bff; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block;">
              Verify Email Address
            </a>
          </div>
          <p>If the button doesn't work, you can also copy and paste this link into your browser:</p>
          <p style="word-break: break-all; color: #666;">${verificationUrl}</p>
          <p style="color: #666; font-size: 14px;">This link will expire in 24 hours.</p>
          <hr style="margin: 30px 0; border: none; border-top: 1px solid #eee;">
          <p style="color: #999; font-size: 12px;">If you didn't create an account with Boxinator, you can safely ignore this email.</p>
        </div>
      `
    };

    await transporter.sendMail(mailOptions);
    logger.info(`Verification email sent to: ${email}`);
  } catch (error) {
    logger.error('Error sending verification email:', error);
    throw error;
  }
};

/**
 * Send welcome email after verification
 * @param {string} email - Recipient email
 * @param {string} firstName - User's first name
 */
const sendWelcomeEmail = async (email, firstName) => {
  try {
    const transporter = createTransporter();

    const mailOptions = {
      from: process.env.FROM_EMAIL,
      to: email,
      subject: 'Welcome to Boxinator - Account Verified!',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #333;">Welcome to Boxinator, ${firstName}!</h2>
          <p>Your email address has been successfully verified. You can now start using Boxinator to send mystery boxes worldwide!</p>
          <div style="background-color: #f8f9fa; padding: 20px; border-radius: 5px; margin: 20px 0;">
            <h3 style="color: #333; margin-top: 0;">What you can do now:</h3>
            <ul style="color: #666;">
              <li>Create and track shipments</li>
              <li>Choose from 4 different box tiers</li>
              <li>Ship to countries worldwide</li>
              <li>View your shipment history</li>
            </ul>
          </div>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${process.env.FRONTEND_URL}/login" style="background-color: #28a745; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block;">
              Start Shipping
            </a>
          </div>
          <p style="color: #666; font-size: 14px;">Happy shipping!</p>
          <p style="color: #666; font-size: 14px;">The Boxinator Team</p>
        </div>
      `
    };

    await transporter.sendMail(mailOptions);
    logger.info(`Welcome email sent to: ${email}`);
  } catch (error) {
    logger.error('Error sending welcome email:', error);
  }
};

/**
 * Send shipment receipt email
 * @param {string} email - Recipient email
 * @param {Object} shipment - Shipment object
 * @param {boolean} isGuest - Whether user is a guest
 */
const sendShipmentReceiptEmail = async (email, shipment, isGuest = false) => {
  try {
    const transporter = createTransporter();
    const createAccountUrl = `${process.env.FRONTEND_URL}/claim-shipment/${shipment.id}`;

    const mailOptions = {
      from: process.env.FROM_EMAIL,
      to: email,
      subject: `Boxinator Shipment Receipt - Order #${shipment.id}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #333;">Shipment Receipt</h2>
          <p>Thank you for using Boxinator! Here are your shipment details:</p>
          
          <div style="background-color: #f8f9fa; padding: 20px; border-radius: 5px; margin: 20px 0;">
            <table style="width: 100%; border-collapse: collapse;">
              <tr>
                <td style="padding: 8px 0; font-weight: bold;">Order ID:</td>
                <td style="padding: 8px 0;">#${shipment.id}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; font-weight: bold;">Receiver:</td>
                <td style="padding: 8px 0;">${shipment.receiverName}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; font-weight: bold;">Weight:</td>
                <td style="padding: 8px 0;">${shipment.weight}kg</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; font-weight: bold;">Destination:</td>
                <td style="padding: 8px 0;">${shipment.destinationCountry.name}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; font-weight: bold;">Total Cost:</td>
                <td style="padding: 8px 0; font-size: 18px; font-weight: bold; color: #007bff;">${shipment.totalCost} Kr</td>
              </tr>
            </table>
          </div>

          ${isGuest ? `
            <div style="background-color: #fff3cd; padding: 15px; border-radius: 5px; margin: 20px 0; border-left: 4px solid #ffc107;">
              <h3 style="color: #856404; margin-top: 0;">Create an Account to Track Your Shipment</h3>
              <p style="color: #856404;">You can create a full account to track this shipment and manage future orders:</p>
              <div style="text-align: center; margin: 15px 0;">
                <a href="${createAccountUrl}" style="background-color: #ffc107; color: #212529; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block; font-weight: bold;">
                  Create Account & Claim Shipment
                </a>
              </div>
            </div>
          ` : ''}

          <p style="color: #666; font-size: 14px;">You will receive updates as your shipment progresses through our system.</p>
          <p style="color: #666; font-size: 14px;">Thank you for choosing Boxinator!</p>
        </div>
      `
    };

    await transporter.sendMail(mailOptions);
    logger.info(`Shipment receipt sent to: ${email} for shipment: ${shipment.id}`);
  } catch (error) {
    logger.error('Error sending shipment receipt:', error);
    throw error;
  }
};

module.exports = {
  sendVerificationEmail,
  sendWelcomeEmail,
  sendShipmentReceiptEmail
};
