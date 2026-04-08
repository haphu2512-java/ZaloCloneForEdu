const nodemailer = require('nodemailer');
const logger = require('./logger');
const env = require('../config/env');

const createTransporter = () => {
  // If no SMTP configured, use ethereal (for dev) or just log
  if (!env.smtpHost) {
    logger.warn('No SMTP configuration found. Emails will be logged to console instead of sent.');
    return {
      sendMail: async (mailOptions) => {
        logger.info(`[MOCK EMAIL] To: ${mailOptions.to}, Subject: ${mailOptions.subject}`);
        logger.info(`[MOCK EMAIL BODY]\n${mailOptions.text || mailOptions.html}`);
        return { messageId: 'mock-id' };
      },
    };
  }

  return nodemailer.createTransport({
    host: env.smtpHost,
    port: env.smtpPort,
    secure: env.smtpPort === 465, // true for 465, false for other ports
    auth: {
      user: env.smtpUser,
      pass: env.smtpPass,
    },
  });
};

const transporter = createTransporter();

const sendEmail = async ({ to, subject, text, html }) => {
  try {
    const info = await transporter.sendMail({
      from: env.smtpFrom || '"Zalo Clone" <noreply@example.com>',
      to,
      subject,
      text,
      html,
    });
    logger.info(`Email sent: ${info.messageId}`);
    return info;
  } catch (error) {
    logger.error(`Error sending email to ${to}: ${error.message}`);
    throw error;
  }
};

module.exports = {
  sendEmail,
};
