const mongoose = require('mongoose');

const GradeSchema = new mongoose.Schema({
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
  assignment: {
    type: mongoose.Schema.ObjectId,
    ref: 'Assignment',
    required: [true, 'Please add an assignment']
  },
  submission: {
    type: mongoose.Schema.ObjectId,
    ref: 'Submission'
  },
  score: {
    type: Number,
    min: [0, 'Score cannot be negative']
  },
  maxScore: {
    type: Number,
    min: [1, 'Maximum score must be at least 1']
  },
  status: {
    type: String,
    enum: ['pending', 'submitted', 'graded', 'returned', 'late'],
    default: 'pending'
  },
  submittedAt: {
    type: Date
  },
  textSubmission: {
    type: String
  },
  files: [{
    fileName: String,
    fileUrl: String,
    fileSize: Number,
    mimeType: String,
    publicId: String,
    uploadedAt: {
      type: Date,
      default: Date.now
    }
  }],
  isLate: {
    type: Boolean,
    default: false
  },
  latePenalty: {
    type: Number,
    default: 0
  },
  percentage: {
    type: Number,
    min: 0,
    max: 100
  },
  letterGrade: {
    type: String,
    enum: ['A+', 'A', 'A-', 'B+', 'B', 'B-', 'C+', 'C', 'C-', 'D+', 'D', 'F']
  },
  feedback: {
    type: String,
    maxlength: [1000, 'Feedback cannot be more than 1000 characters']
  },
  isExcused: {
    type: Boolean,
    default: false
  },
  gradedBy: {
    type: mongoose.Schema.ObjectId,
    ref: 'User'
  },
  gradedAt: {
    type: Date
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Compound index to prevent duplicate grades
GradeSchema.index({ student: 1, assignment: 1 }, { unique: true });

// Index for efficient queries
GradeSchema.index({ course: 1, student: 1 });
GradeSchema.index({ gradedAt: -1 });

// Calculate percentage before saving
GradeSchema.pre('save', function(next) {
  if (this.score !== undefined && this.maxScore !== undefined) {
    this.percentage = Math.round((this.score / this.maxScore) * 100 * 100) / 100;
  }
  this.updatedAt = Date.now();
  next();
});

// Calculate letter grade based on percentage
GradeSchema.pre('save', function(next) {
  if (this.percentage !== undefined && !this.isExcused) {
    if (this.percentage >= 97) this.letterGrade = 'A+';
    else if (this.percentage >= 93) this.letterGrade = 'A';
    else if (this.percentage >= 90) this.letterGrade = 'A-';
    else if (this.percentage >= 87) this.letterGrade = 'B+';
    else if (this.percentage >= 83) this.letterGrade = 'B';
    else if (this.percentage >= 80) this.letterGrade = 'B-';
    else if (this.percentage >= 77) this.letterGrade = 'C+';
    else if (this.percentage >= 73) this.letterGrade = 'C';
    else if (this.percentage >= 70) this.letterGrade = 'C-';
    else if (this.percentage >= 67) this.letterGrade = 'D+';
    else if (this.percentage >= 60) this.letterGrade = 'D';
    else this.letterGrade = 'F';
  }
  next();
});

module.exports = mongoose.model('Grade', GradeSchema);