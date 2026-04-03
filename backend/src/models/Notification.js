const mongoose = require('mongoose');

const NotificationSchema = new mongoose.Schema({
  recipient: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: true
  },
  sender: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: true
  },
  title: {
    type: String,
    required: [true, 'Please add a title']
  },
  message: {
    type: String,
    required: [true, 'Please add a message']
  },
  type: {
    type: String,
    enum: ['info', 'success', 'warning', 'error', 'assignment', 'grade', 'announcement'],
    default: 'info'
  },
  link: {
    type: String
  },
  isRead: {
    type: Boolean,
    default: false
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Index for efficient queries
NotificationSchema.index({ recipient: 1, isRead: 1 });
NotificationSchema.index({ createdAt: -1 });

module.exports = mongoose.model('Notification', NotificationSchema);
