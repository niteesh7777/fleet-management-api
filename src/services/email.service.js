import sgMail from '@sendgrid/mail';
import nodemailer from 'nodemailer';
import { getTemplate } from '../templates/email.templates.js';
import { config } from '../config/env.js';

const SENDGRID_API_KEY = process.env.SENDGRID_API_KEY;
const EMAIL_FROM = process.env.EMAIL_FROM || 'noreply@fleetmanagement.com';
const EMAIL_PROVIDER = process.env.EMAIL_PROVIDER || 'mock'; // 'sendgrid', 'nodemailer', or 'mock'

if (SENDGRID_API_KEY && EMAIL_PROVIDER === 'sendgrid') {
  sgMail.setApiKey(SENDGRID_API_KEY);
  if (config.nodeEnv === 'development') {
    console.log('✅ SendGrid email configured');
  }
}

let transporter = null;
if (EMAIL_PROVIDER === 'nodemailer' && process.env.SMTP_USER && process.env.SMTP_PASS) {
  transporter = nodemailer.createTransporter({
    host: process.env.SMTP_HOST || 'smtp.ethereal.email',
    port: parseInt(process.env.SMTP_PORT, 10) || 587,
    secure: process.env.SMTP_SECURE === 'true',
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });
  if (config.nodeEnv === 'development') {
    console.log('✅ SMTP email configured');
  }
}

/**
 * Send email using configured provider
 * @param {string} type - Email template type
 * @param {string} to - Recipient email
 * @param {object} data - Template data
 * @param {string} companyId - Company ID for tracking
 */
export const sendEmail = async (type, to, data, companyId = null) => {
  // Mock mode - just log the email
  if (EMAIL_PROVIDER === 'mock' || (!SENDGRID_API_KEY && !transporter)) {
    if (config.nodeEnv === 'development') {
      console.log(`📧 [MOCK] Email: ${type} → ${to}`);
    }
    return { messageId: 'mock-' + Date.now() };
  }

  try {
    const template = getTemplate(type, data);

    if (SENDGRID_API_KEY && EMAIL_PROVIDER === 'sendgrid') {
      const msg = {
        to,
        from: EMAIL_FROM,
        subject: template.subject,
        text: template.text,
        html: template.html,
        customArgs: { companyId: companyId || 'system', emailType: type },
      };
      return await sgMail.send(msg);
    }

    if (transporter) {
      const info = await transporter.sendMail({
        from: EMAIL_FROM,
        to,
        subject: template.subject,
        text: template.text,
        html: template.html,
      });
      if (config.nodeEnv === 'development') {
        console.log('Preview:', nodemailer.getTestMessageUrl(info));
      }
      return info;
    }

    throw new Error('No email provider configured');
  } catch (error) {
    console.error('Email error:', error.message);
  }
};

/**
 * Queue email for background processing
 * @param {string} type - Email template type
 * @param {string} to - Recipient email
 * @param {object} data - Template data
 * @param {string} companyId - Company ID
 */
export const queueEmail = async (type, to, data, companyId = null) => {
  const { emailQueue } = await import('../config/queue.js');

  await emailQueue.add(
    'send-email',
    {
      type,
      to,
      data,
      companyId,
    },
    {
      attempts: 3,
      backoff: {
        type: 'exponential',
        delay: 5000,
      },
    }
  );

  console.log(`📬 Email queued: ${type} to ${to}`);
};

/**
 * Send welcome email to new company
 */
export const sendWelcomeEmail = async (company, owner) => {
  return queueEmail(
    'welcome',
    owner.email,
    {
      ownerName: owner.name,
      companyName: company.name,
      email: owner.email,
      plan: company.plan,
      trialEndsAt: company.trialEndsAt,
    },
    company._id.toString()
  );
};

/**
 * Send password reset email
 */
export const sendPasswordResetEmail = async (user, resetToken) => {
  const resetLink = `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}`;

  return queueEmail('password-reset', user.email, {
    userName: user.name,
    resetLink,
    expiresIn: '1 hour',
  });
};

/**
 * Send trip assignment notification to driver
 */
export const sendTripAssignmentEmail = async (trip, driver) => {
  return queueEmail(
    'trip-assigned',
    driver.email,
    {
      driverName: driver.name,
      tripCode: trip.tripCode,
      tripId: trip._id.toString(),
      vehicleNo: trip.vehicleNo,
      source: trip.source,
      destination: trip.destination,
      scheduledStart: trip.scheduledStart,
      goodsInfo: trip.goodsInfo,
    },
    trip.companyId.toString()
  );
};

/**
 * Send plan limit warning
 */
export const sendPlanLimitWarning = async (
  company,
  owner,
  resourceType,
  currentCount,
  maxLimit
) => {
  return queueEmail(
    'plan-limit-warning',
    owner.email,
    {
      ownerName: owner.name,
      companyName: company.name,
      plan: company.plan,
      resourceType,
      currentCount,
      maxLimit,
    },
    company._id.toString()
  );
};

/**
 * Send subscription expiring notification
 */
export const sendSubscriptionExpiringEmail = async (company, owner, daysRemaining) => {
  return queueEmail(
    'subscription-expiring',
    owner.email,
    {
      ownerName: owner.name,
      companyName: company.name,
      plan: company.plan,
      expiryDate: company.subscriptionEndDate,
      daysRemaining,
    },
    company._id.toString()
  );
};
