const mongoose = require('mongoose');

const auditLogSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  action: {
    type: String,
    required: true,
    enum: ['login', 'logout', 'create_user', 'update_user', 'delete_user', 'create_course', 'delete_course', 'enroll', 'unenroll', 'system_setting_change', 'unauthorized_access']
  },
  module: {
    type: String,
    required: true,
    enum: ['auth', 'user', 'course', 'enrollment', 'system', 'security']
  },
  details: {
    type: String,
    default: ''
  },
  ipAddress: String,
  userAgent: String,
  status: {
    type: String,
    enum: ['success', 'failure'],
    default: 'success'
  },
  timestamp: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Index for faster queries
auditLogSchema.index({ user: 1, timestamp: -1 });
auditLogSchema.index({ action: 1, module: 1 });

module.exports = mongoose.model('AuditLog', auditLogSchema);
