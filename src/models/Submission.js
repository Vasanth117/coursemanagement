const mongoose = require('mongoose');

const SubmissionSchema = new mongoose.Schema({
  assignment: {
    type: mongoose.Schema.ObjectId,
    ref: 'Assignment',
    required: [true, 'Please add an assignment']
  },
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
  content: {
    type: String,
    maxlength: [5000, 'Content cannot be more than 5000 characters']
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
  status: {
    type: String,
    enum: ['draft', 'submitted', 'graded', 'returned'],
    default: 'draft'
  },
  submittedAt: {
    type: Date
  },
  isLate: {
    type: Boolean,
    default: false
  },
  feedback: {
    type: String,
    maxlength: [1000, 'Feedback cannot be more than 1000 characters']
  },
  grade: {
    type: Number,
    min: 0
  },
  gradedBy: {
    type: mongoose.Schema.ObjectId,
    ref: 'User'
  },
  gradedAt: {
    type: Date
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

// Compound index to prevent duplicate submissions
SubmissionSchema.index({ assignment: 1, student: 1 }, { unique: true });

// Index for efficient queries
SubmissionSchema.index({ status: 1 });
SubmissionSchema.index({ submittedAt: -1 });
SubmissionSchema.index({ course: 1, assignment: 1 });

// Update the updatedAt field before saving
SubmissionSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Set submittedAt when status changes to submitted
SubmissionSchema.pre('save', function(next) {
  if (this.isModified('status') && this.status === 'submitted' && !this.submittedAt) {
    this.submittedAt = Date.now();
  }
  next();
});

module.exports = mongoose.model('Submission', SubmissionSchema);