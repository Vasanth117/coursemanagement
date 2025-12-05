const nodemailer = require('nodemailer');
const ErrorResponse = require('../utils/ErrorResponse');

class EmailService {
  constructor() {
    this.transporter = nodemailer.createTransporter({
      host: process.env.SMTP_HOST,
      port: process.env.SMTP_PORT,
      secure: false,
      auth: {
        user: process.env.SMTP_EMAIL,
        pass: process.env.SMTP_PASSWORD
      }
    });
  }

  // Send email helper
  async sendEmail(options) {
    try {
      const message = {
        from: `${process.env.FROM_NAME} <${process.env.FROM_EMAIL}>`,
        to: options.email,
        subject: options.subject,
        html: options.html
      };

      const info = await this.transporter.sendMail(message);
      console.log('Message sent: %s', info.messageId);
      return info;
    } catch (error) {
      console.error('Email send error:', error);
      throw new ErrorResponse('Email could not be sent', 500);
    }
  }

  // Welcome email
  async sendWelcomeEmail(email, name) {
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #333;">Welcome to Course Management System!</h2>
        <p>Hello ${name},</p>
        <p>Welcome to our Course Management System. Your account has been successfully created.</p>
        <p>You can now log in and start exploring the platform.</p>
        <div style="margin: 20px 0; padding: 20px; background-color: #f8f9fa; border-radius: 5px;">
          <p><strong>Next Steps:</strong></p>
          <ul>
            <li>Complete your profile information</li>
            <li>Browse available courses</li>
            <li>Connect with your instructors and classmates</li>
          </ul>
        </div>
        <p>If you have any questions, please don't hesitate to contact our support team.</p>
        <p>Best regards,<br>Course Management Team</p>
      </div>
    `;

    await this.sendEmail({
      email,
      subject: 'Welcome to Course Management System',
      html
    });
  }

  // Password reset email
  async sendPasswordResetEmail(email, resetToken) {
    const resetUrl = `${process.env.CLIENT_URL}/reset-password/${resetToken}`;
    
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #333;">Password Reset Request</h2>
        <p>You are receiving this email because you (or someone else) has requested the reset of a password.</p>
        <p>Please click on the following link to reset your password:</p>
        <div style="margin: 20px 0; text-align: center;">
          <a href="${resetUrl}" style="background-color: #007bff; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block;">Reset Password</a>
        </div>
        <p>If you did not request this, please ignore this email and your password will remain unchanged.</p>
        <p><strong>This link will expire in 10 minutes.</strong></p>
        <p>If the button doesn't work, copy and paste this URL into your browser:</p>
        <p style="word-break: break-all; color: #666;">${resetUrl}</p>
      </div>
    `;

    await this.sendEmail({
      email,
      subject: 'Password Reset Request',
      html
    });
  }

  // Course enrollment notification
  async sendEnrollmentNotification(email, studentName, courseName, status) {
    const statusMessages = {
      enrolled: 'You have been successfully enrolled in',
      approved: 'Your enrollment request has been approved for',
      rejected: 'Your enrollment request has been rejected for',
      dropped: 'You have been dropped from'
    };

    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #333;">Enrollment Update</h2>
        <p>Hello ${studentName},</p>
        <p>${statusMessages[status]} <strong>${courseName}</strong>.</p>
        ${status === 'enrolled' || status === 'approved' ? 
          '<p>You can now access course materials and participate in class activities.</p>' : 
          status === 'rejected' ? 
          '<p>Please contact your academic advisor for more information.</p>' : 
          '<p>If you have any questions, please contact the registrar\'s office.</p>'
        }
        <p>Best regards,<br>Course Management Team</p>
      </div>
    `;

    await this.sendEmail({
      email,
      subject: `Enrollment Update - ${courseName}`,
      html
    });
  }

  // Assignment notification
  async sendAssignmentNotification(email, studentName, assignmentTitle, courseName, dueDate) {
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #333;">New Assignment Posted</h2>
        <p>Hello ${studentName},</p>
        <p>A new assignment has been posted in <strong>${courseName}</strong>:</p>
        <div style="margin: 20px 0; padding: 20px; background-color: #f8f9fa; border-radius: 5px;">
          <h3 style="margin: 0 0 10px 0; color: #333;">${assignmentTitle}</h3>
          <p><strong>Due Date:</strong> ${new Date(dueDate).toLocaleDateString()}</p>
        </div>
        <p>Please log in to the system to view the assignment details and submit your work.</p>
        <p>Best regards,<br>Course Management Team</p>
      </div>
    `;

    await this.sendEmail({
      email,
      subject: `New Assignment: ${assignmentTitle}`,
      html
    });
  }

  // Grade notification
  async sendGradeNotification(email, studentName, assignmentTitle, grade, courseName) {
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #333;">Grade Posted</h2>
        <p>Hello ${studentName},</p>
        <p>Your grade has been posted for the following assignment:</p>
        <div style="margin: 20px 0; padding: 20px; background-color: #f8f9fa; border-radius: 5px;">
          <h3 style="margin: 0 0 10px 0; color: #333;">${assignmentTitle}</h3>
          <p><strong>Course:</strong> ${courseName}</p>
          <p><strong>Grade:</strong> ${grade}</p>
        </div>
        <p>Please log in to the system to view detailed feedback and comments.</p>
        <p>Best regards,<br>Course Management Team</p>
      </div>
    `;

    await this.sendEmail({
      email,
      subject: `Grade Posted: ${assignmentTitle}`,
      html
    });
  }

  // Announcement notification
  async sendAnnouncementNotification(email, userName, title, content, courseName = null) {
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #333;">New Announcement</h2>
        <p>Hello ${userName},</p>
        ${courseName ? `<p>A new announcement has been posted in <strong>${courseName}</strong>:</p>` : '<p>A new system announcement has been posted:</p>'}
        <div style="margin: 20px 0; padding: 20px; background-color: #f8f9fa; border-radius: 5px; border-left: 4px solid #007bff;">
          <h3 style="margin: 0 0 10px 0; color: #333;">${title}</h3>
          <p style="margin: 0;">${content}</p>
        </div>
        <p>Please log in to the system to view the full announcement.</p>
        <p>Best regards,<br>Course Management Team</p>
      </div>
    `;

    await this.sendEmail({
      email,
      subject: `New Announcement: ${title}`,
      html
    });
  }

  // Bulk email sending
  async sendBulkEmails(recipients, subject, htmlTemplate, data = {}) {
    const promises = recipients.map(recipient => {
      let personalizedHtml = htmlTemplate;
      
      // Replace placeholders with recipient-specific data
      Object.keys(data).forEach(key => {
        const placeholder = `{{${key}}}`;
        personalizedHtml = personalizedHtml.replace(new RegExp(placeholder, 'g'), data[key]);
      });

      // Replace recipient-specific placeholders
      personalizedHtml = personalizedHtml.replace(/{{name}}/g, recipient.name);
      personalizedHtml = personalizedHtml.replace(/{{email}}/g, recipient.email);

      return this.sendEmail({
        email: recipient.email,
        subject,
        html: personalizedHtml
      });
    });

    try {
      await Promise.all(promises);
      return { success: true, sent: recipients.length };
    } catch (error) {
      console.error('Bulk email error:', error);
      throw new ErrorResponse('Some emails could not be sent', 500);
    }
  }

  // Test email configuration
  async testConnection() {
    try {
      await this.transporter.verify();
      return { success: true, message: 'Email service is configured correctly' };
    } catch (error) {
      console.error('Email configuration error:', error);
      throw new ErrorResponse('Email service configuration error', 500);
    }
  }
}

module.exports = new EmailService();