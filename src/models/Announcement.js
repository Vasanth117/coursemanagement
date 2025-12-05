const mongoose = require('mongoose');

const AnnouncementSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Please add an announcement title'],
    trim: true,
    maxlength: [100, 'Title cannot be more than 100 characters']
  },
  content: {
    type: String,
    required: [true, 'Please add announcement content'],
    maxlength: [2000, 'Content cannot be more than 2000 characters']
  },
  type: {
    type: String,
    enum: ['general', 'urgent', 'assignment', 'exam', 'event', 'system'],
    default: 'general'
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'critical'],
    default: 'medium'
  },
  course: {
    type: mongoose.Schema.ObjectId,
    ref: 'Course'
  },
  targetAudience: {
    type: String,
    enum: ['all', 'students', 'faculty', 'course-specific'],
    default: 'all'
  },
  isPublished: {
    type: Boolean,
    default: false
  },
  publishAt: {
    type: Date,
    default: Date.now
  },
  expiresAt: {
    type: Date
  },
  attachments: [{
    filename: String,
    originalName: String,
    path: String,
    size: Number,
    uploadedAt: {
      type: Date,
      default: Date.now
    }
  }],
  readBy: [{
    user: {
      type: mongoose.Schema.ObjectId,
      ref: 'User'
    },
    readAt: {
      type: Date,
      default: Date.now
    }
  }],
  createdBy: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: [true, 'Please add creator']
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Index for efficient queries
AnnouncementSchema.index({ isPublished: 1, publishAt: -1 });
AnnouncementSchema.index({ course: 1, publishAt: -1 });
AnnouncementSchema.index({ targetAudience: 1 });
AnnouncementSchema.index({ priority: 1 });
AnnouncementSchema.index({ expiresAt: 1 });

// Update the updatedAt field before saving
AnnouncementSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Virtual for read count
AnnouncementSchema.virtual('readCount').get(function() {
  return this.readBy.length;
});

module.exports = mongoose.model('Announcement', AnnouncementSchema);