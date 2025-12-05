const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: process.env.SMTP_PORT,
  secure: false, // true for 465, false for other ports
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

// Verify connection
transporter.verify(function (error, success) {
  if (error) {
    console.log('❌ SMTP connection error:', error);
  } else {
    console.log('✅ SMTP server is ready to send emails');
  }
});

// Email templates
const emailTemplates = {
  welcome: (name) => ({
    subject: `Welcome to Course Management System, ${name}!`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #3b82f6;">Welcome to Course Management System!</h2>
        <p>Dear ${name},</p>
        <p>Your account has been successfully created. You can now login and start using our platform.</p>
        <p>If you have any questions, please contact our support team.</p>
        <br/>
        <p>Best regards,<br/>Course Management System Team</p>
      </div>
    `
  }),
  passwordReset: (name, resetLink) => ({
    subject: 'Password Reset Request',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #3b82f6;">Password Reset Request</h2>
        <p>Dear ${name},</p>
        <p>You requested to reset your password. Click the link below to reset your password:</p>
        <a href="${resetLink}" style="background-color: #3b82f6; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block; margin: 10px 0;">
          Reset Password
        </a>
        <p>This link will expire in 1 hour.</p>
        <p>If you didn't request this, please ignore this email.</p>
        <br/>
        <p>Best regards,<br/>Course Management System Team</p>
      </div>
    `
  })
};

module.exports = { transporter, emailTemplates };