const mongoose = require('mongoose');

const AssignmentSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Please add an assignment title'],
    trim: true,
    maxlength: [100, 'Title cannot be more than 100 characters']
  },
  description: {
    type: String,
    required: [true, 'Please add a description'],
    maxlength: [1000, 'Description cannot be more than 1000 characters']
  },
  course: {
    type: mongoose.Schema.ObjectId,
    ref: 'Course',
    required: [true, 'Please add a course']
  },
  type: {
    type: String,
    required: [true, 'Please add assignment type'],
    enum: ['homework', 'quiz', 'exam', 'project', 'lab']
  },
  maxPoints: {
    type: Number,
    required: [true, 'Please add maximum points'],
    min: [1, 'Maximum points must be at least 1']
  },
  weightage: {
    type: Number,
    default: 1,
    min: [0.1, 'Weightage must be at least 0.1'],
    max: [10, 'Weightage cannot be more than 10']
  },
  dueDate: {
    type: Date,
    required: [true, 'Please add a due date']
  },
  instructions: {
    type: String,
    maxlength: [2000, 'Instructions cannot be more than 2000 characters']
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
  isPublished: {
    type: Boolean,
    default: false
  },
  allowLateSubmission: {
    type: Boolean,
    default: false
  },
  latePenalty: {
    type: Number,
    default: 0,
    min: [0, 'Late penalty cannot be negative'],
    max: [100, 'Late penalty cannot be more than 100%']
  },
  createdBy: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: true
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

// Update the updatedAt field before saving
AssignmentSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Index for efficient queries
AssignmentSchema.index({ course: 1, dueDate: 1 });
AssignmentSchema.index({ isPublished: 1 });

module.exports = mongoose.model('Assignment', AssignmentSchema);