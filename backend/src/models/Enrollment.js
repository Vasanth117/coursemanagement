const mongoose = require('mongoose');

const EnrollmentSchema = new mongoose.Schema({
  student: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: [true, 'Please add a student']
  },
  course: {
    type: mongoose.Schema.ObjectId,
    ref: 'Course',
    required: [true, 'Please add a course']
  },
  status: {
    type: String,
    enum: ['pending', 'enrolled', 'completed', 'dropped', 'rejected'],
    default: 'pending'
  },
  enrolledAt: {
    type: Date,
    default: Date.now
  },
  completedAt: {
    type: Date
  },
  grade: {
    type: Number,
    min: 0,
    max: 100
  },
  enrolledBy: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: true
  },
  approvedBy: {
    type: mongoose.Schema.ObjectId,
    ref: 'User'
  },
  approvedAt: {
    type: Date
  },
  rejectedBy: {
    type: mongoose.Schema.ObjectId,
    ref: 'User'
  },
  rejectedAt: {
    type: Date
  },
  rejectionReason: {
    type: String,
    maxlength: [200, 'Rejection reason cannot be more than 200 characters']
  }
});

// Compound index to prevent duplicate enrollments
EnrollmentSchema.index({ student: 1, course: 1 }, { unique: true });

// Index for efficient queries
EnrollmentSchema.index({ status: 1 });
EnrollmentSchema.index({ enrolledAt: -1 });

module.exports = mongoose.model('Enrollment', EnrollmentSchema);