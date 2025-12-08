const { User, Enrollment, Course } = require('../models');
const emailService = require('./emailService');
const ErrorResponse = require('../utils/ErrorResponse');

class NotificationService {
  constructor() {
    this.notificationTypes = {
      ENROLLMENT: 'enrollment',
      ASSIGNMENT: 'assignment',
      GRADE: 'grade',
      ANNOUNCEMENT: 'announcement',
      ATTENDANCE: 'attendance',
      SYSTEM: 'system'
    };
  }

  // Send notification to single user
  async sendNotification(userId, type, data, channels = ['email']) {
    try {
      const user = await User.findById(userId);
      if (!user || !user.isActive) {
        throw new ErrorResponse('User not found or inactive', 404);
      }

      const notifications = [];

      // Send email notification
      if (channels.includes('email')) {
        const emailResult = await this.sendEmailNotification(user, type, data);
        notifications.push({ channel: 'email', ...emailResult });
      }

      // Add push notification support here if needed
      if (channels.includes('push')) {
        // const pushResult = await this.sendPushNotification(user, type, data);
        // notifications.push({ channel: 'push', ...pushResult });
      }

      return {
        success: true,
        userId,
        type,
        notifications
      };
    } catch (error) {
      console.error('Notification send error:', error);
      throw new ErrorResponse('Failed to send notification', 500);
    }
  }

  // Send email notification based on type
  async sendEmailNotification(user, type, data) {
    switch (type) {
      case this.notificationTypes.ENROLLMENT:
        return await this.sendEnrollmentNotification(user, data);
      
      case this.notificationTypes.ASSIGNMENT:
        return await this.sendAssignmentNotification(user, data);
      
      case this.notificationTypes.GRADE:
        return await this.sendGradeNotification(user, data);
      
      case this.notificationTypes.ANNOUNCEMENT:
        return await this.sendAnnouncementNotification(user, data);
      
      case this.notificationTypes.ATTENDANCE:
        return await this.sendAttendanceNotification(user, data);
      
      case this.notificationTypes.SYSTEM:
        return await this.sendSystemNotification(user, data);
      
      default:
        throw new ErrorResponse('Invalid notification type', 400);
    }
  }

  // Enrollment notification
  async sendEnrollmentNotification(user, data) {
    const { courseName, status, message } = data;
    
    await emailService.sendEnrollmentNotification(
      user.email,
      user.name,
      courseName,
      status
    );

    return { success: true, message: 'Enrollment notification sent' };
  }

  // Assignment notification
  async sendAssignmentNotification(user, data) {
    const { assignmentTitle, courseName, dueDate, type } = data;
    
    if (type === 'new') {
      await emailService.sendAssignmentNotification(
        user.email,
        user.name,
        assignmentTitle,
        courseName,
        dueDate
      );
    }

    return { success: true, message: 'Assignment notification sent' };
  }

  // Grade notification
  async sendGradeNotification(user, data) {
    const { assignmentTitle, grade, courseName } = data;
    
    await emailService.sendGradeNotification(
      user.email,
      user.name,
      assignmentTitle,
      grade,
      courseName
    );

    return { success: true, message: 'Grade notification sent' };
  }

  // Announcement notification
  async sendAnnouncementNotification(user, data) {
    const { title, content, courseName } = data;
    
    await emailService.sendAnnouncementNotification(
      user.email,
      user.name,
      title,
      content,
      courseName
    );

    return { success: true, message: 'Announcement notification sent' };
  }

  // Attendance notification
  async sendAttendanceNotification(user, data) {
    const { courseName, date, status, message } = data;
    
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #333;">Attendance Update</h2>
        <p>Hello ${user.name},</p>
        <p>Your attendance has been recorded for <strong>${courseName}</strong>:</p>
        <div style="margin: 20px 0; padding: 20px; background-color: #f8f9fa; border-radius: 5px;">
          <p><strong>Date:</strong> ${new Date(date).toLocaleDateString()}</p>
          <p><strong>Status:</strong> ${status.toUpperCase()}</p>
          ${message ? `<p><strong>Note:</strong> ${message}</p>` : ''}
        </div>
        <p>Best regards,<br>Course Management Team</p>
      </div>
    `;

    await emailService.sendEmail({
      email: user.email,
      subject: `Attendance Update - ${courseName}`,
      html
    });

    return { success: true, message: 'Attendance notification sent' };
  }

  // System notification
  async sendSystemNotification(user, data) {
    const { title, message, priority = 'medium' } = data;
    
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #333;">${title}</h2>
        <p>Hello ${user.name},</p>
        <div style="margin: 20px 0; padding: 20px; background-color: ${priority === 'high' ? '#fff3cd' : '#f8f9fa'}; border-radius: 5px; border-left: 4px solid ${priority === 'high' ? '#ffc107' : '#007bff'};">
          <p>${message}</p>
        </div>
        <p>Best regards,<br>Course Management Team</p>
      </div>
    `;

    await emailService.sendEmail({
      email: user.email,
      subject: title,
      html
    });

    return { success: true, message: 'System notification sent' };
  }

  // Send bulk notifications
  async sendBulkNotifications(userIds, type, data, channels = ['email']) {
    const results = [];
    const errors = [];

    for (const userId of userIds) {
      try {
        const result = await this.sendNotification(userId, type, data, channels);
        results.push(result);
      } catch (error) {
        errors.push({ userId, error: error.message });
      }
    }

    return {
      success: true,
      sent: results.length,
      failed: errors.length,
      results,
      errors
    };
  }

  // Send notifications to course students
  async sendCourseNotifications(courseId, type, data, channels = ['email']) {
    try {
      const enrollments = await Enrollment.find({ 
        course: courseId, 
        status: 'enrolled' 
      }).populate('student');

      const userIds = enrollments.map(enrollment => enrollment.student._id);
      
      return await this.sendBulkNotifications(userIds, type, data, channels);
    } catch (error) {
      throw new ErrorResponse('Failed to send course notifications', 500);
    }
  }

  // Send notifications by role
  async sendRoleNotifications(role, type, data, channels = ['email']) {
    try {
      const users = await User.find({ role, isActive: true });
      const userIds = users.map(user => user._id);
      
      return await this.sendBulkNotifications(userIds, type, data, channels);
    } catch (error) {
      throw new ErrorResponse('Failed to send role notifications', 500);
    }
  }

  // Send notifications to all users
  async sendSystemWideNotifications(type, data, channels = ['email']) {
    try {
      const users = await User.find({ isActive: true });
      const userIds = users.map(user => user._id);
      
      return await this.sendBulkNotifications(userIds, type, data, channels);
    } catch (error) {
      throw new ErrorResponse('Failed to send system-wide notifications', 500);
    }
  }

  // Schedule notification (basic implementation)
  async scheduleNotification(userId, type, data, sendAt, channels = ['email']) {
    const delay = new Date(sendAt).getTime() - Date.now();
    
    if (delay <= 0) {
      throw new ErrorResponse('Scheduled time must be in the future', 400);
    }

    setTimeout(async () => {
      try {
        await this.sendNotification(userId, type, data, channels);
        console.log(`Scheduled notification sent to user ${userId}`);
      } catch (error) {
        console.error('Scheduled notification failed:', error);
      }
    }, delay);

    return {
      success: true,
      message: 'Notification scheduled',
      scheduledFor: sendAt
    };
  }

  // Get notification preferences (placeholder for future implementation)
  async getNotificationPreferences(userId) {
    // This would typically fetch from a user preferences table
    return {
      email: true,
      push: false,
      sms: false,
      types: {
        enrollment: true,
        assignment: true,
        grade: true,
        announcement: true,
        attendance: false,
        system: true
      }
    };
  }

  // Update notification preferences (placeholder for future implementation)
  async updateNotificationPreferences(userId, preferences) {
    // This would typically update a user preferences table
    return {
      success: true,
      message: 'Notification preferences updated',
      preferences
    };
  }

  // Send reminder notifications
  async sendReminders() {
    try {
      // Assignment due reminders (24 hours before)
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      tomorrow.setHours(23, 59, 59, 999);

      const assignments = await Assignment.find({
        dueDate: { $lte: tomorrow, $gte: new Date() },
        isPublished: true
      }).populate('course');

      for (const assignment of assignments) {
        const enrollments = await Enrollment.find({
          course: assignment.course._id,
          status: 'enrolled'
        }).populate('student');

        for (const enrollment of enrollments) {
          await this.sendNotification(
            enrollment.student._id,
            this.notificationTypes.ASSIGNMENT,
            {
              assignmentTitle: assignment.title,
              courseName: assignment.course.title,
              dueDate: assignment.dueDate,
              type: 'reminder'
            }
          );
        }
      }

      return { success: true, message: 'Reminders sent' };
    } catch (error) {
      throw new ErrorResponse('Failed to send reminders', 500);
    }
  }
}

module.exports = new NotificationService();