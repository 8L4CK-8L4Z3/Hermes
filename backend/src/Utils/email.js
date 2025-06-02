import nodemailer from "nodemailer";
import logger from "./logger.js";
import {
  NODE_ENV,
  SMTP_HOST,
  SMTP_PORT,
  SMTP_SECURE,
  SMTP_USER,
  SMTP_PASS,
  EMAIL_FROM_NAME,
  EMAIL_FROM_ADDRESS,
  FRONTEND_URL,
} from "../Configs/config.js";

// Create reusable transporter object using SMTP transport
let transporter;

// Initialize transporter based on environment
const initializeTransporter = async () => {
  if (NODE_ENV === "development") {
    // Create test account for development
    const testAccount = await nodemailer.createTestAccount();
    transporter = nodemailer.createTransport({
      host: "smtp.ethereal.email",
      port: 587,
      secure: false,
      auth: {
        user: testAccount.user,
        pass: testAccount.pass,
      },
    });
    logger.logInfo(
      "Email",
      "Development mode: Using Ethereal Email for testing"
    );
    logger.logInfo("Email", "Preview URL: https://ethereal.email/login");
    logger.logInfo("Email", `Test Account: ${testAccount.user}`);
    logger.logInfo("Email", `Test Password: ${testAccount.pass}`);
  } else {
    // Production SMTP configuration
    transporter = nodemailer.createTransport({
      host: SMTP_HOST,
      port: SMTP_PORT,
      secure: SMTP_SECURE,
      auth: {
        user: SMTP_USER,
        pass: SMTP_PASS,
      },
    });
  }
};

// Initialize transporter and verify connection
const setupTransporter = async () => {
  await initializeTransporter();
  transporter.verify((error, success) => {
    if (error) {
      logger.logError("Email", "SMTP connection error", error);
    } else {
      logger.logInfo("Email", "SMTP server is ready to take our messages");
    }
  });
};
setupTransporter();

// Email templates
const emailTemplates = {
  verification: (verificationLink) => ({
    subject: "Verify Your Email Address",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #333;">Welcome to Our Platform!</h2>
        <p>Thank you for registering. Please verify your email address by clicking the button below:</p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${verificationLink}" 
             style="background-color: #4CAF50; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px;">
            Verify Email Address
          </a>
        </div>
        <p>If the button doesn't work, you can also copy and paste this link into your browser:</p>
        <p style="word-break: break-all;">${verificationLink}</p>
        <p>This link will expire in 24 hours.</p>
        <p>If you didn't create an account, you can safely ignore this email.</p>
      </div>
    `,
  }),
  passwordReset: (resetLink) => ({
    subject: "Password Reset Request",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #333;">Password Reset Request</h2>
        <p>You requested to reset your password. Click the button below to proceed:</p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${resetLink}" 
             style="background-color: #4CAF50; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px;">
            Reset Password
          </a>
        </div>
        <p>If the button doesn't work, you can also copy and paste this link into your browser:</p>
        <p style="word-break: break-all;">${resetLink}</p>
        <p>This link will expire in 1 hour.</p>
        <p>If you didn't request a password reset, you can safely ignore this email.</p>
      </div>
    `,
  }),
};

/**
 * Send an email using the configured transporter
 * @param {Object} options - Email options
 * @param {string} options.email - Recipient email address
 * @param {string} options.subject - Email subject
 * @param {string} options.message - Plain text message
 * @param {string} [options.html] - HTML message (optional)
 * @returns {Promise<void>}
 */
export const sendEmail = async ({ email, subject, message, html }) => {
  try {
    const mailOptions = {
      from: `"${EMAIL_FROM_NAME}" <${EMAIL_FROM_ADDRESS}>`,
      to: email,
      subject,
      text: message,
      html: html || message,
    };

    const info = await transporter.sendMail(mailOptions);
    logger.logInfo("Email", "Email sent successfully:", info.messageId);
    return info;
  } catch (error) {
    logger.logError("Email", "Error sending email:", error);
    throw new Error("Failed to send email");
  }
};

/**
 * Send a verification email
 * @param {string} email - Recipient email address
 * @param {string} verificationToken - Verification token
 * @returns {Promise<void>}
 */
export const sendVerificationEmail = async (email, verificationToken) => {
  const verificationLink = `${FRONTEND_URL}/verify-email/${verificationToken}`;
  const template = emailTemplates.verification(verificationLink);

  return sendEmail({
    email,
    subject: template.subject,
    message: `Please verify your email by visiting: ${verificationLink}`,
    html: template.html,
  });
};

/**
 * Send a password reset email
 * @param {string} email - Recipient email address
 * @param {string} resetToken - Password reset token
 * @returns {Promise<void>}
 */
export const sendPasswordResetEmail = async (email, resetToken) => {
  const resetLink = `${FRONTEND_URL}/reset-password/${resetToken}`;
  const template = emailTemplates.passwordReset(resetLink);

  return sendEmail({
    email,
    subject: template.subject,
    message: `Reset your password by visiting: ${resetLink}`,
    html: template.html,
  });
};
