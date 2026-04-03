const mongoose = require('mongoose');

const CourseSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Please add a course title'],
    trim: true,
    maxlength: [100, 'Title cannot be more than 100 characters']
  },
  code: {
    type: String,
    required: [true, 'Please add a course code'],
    unique: true,
    uppercase: true,
    trim: true,
    maxlength: [10, 'Course code cannot be more than 10 characters']
  },
  description: {
    type: String,
    required: [true, 'Please add a description'],
    maxlength: [500, 'Description cannot be more than 500 characters']
  },
  credits: {
    type: Number,
    required: [true, 'Please add number of credits'],
    min: [1, 'Credits must be at least 1'],
    max: [6, 'Credits cannot be more than 6']
  },
  department: {
    type: String,
    required: [true, 'Please add a department'],
    trim: true
  },
  faculty: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: [true, 'Please assign a faculty member']
  },
  maxStudents: {
    type: Number,
    required: [true, 'Please add maximum number of students'],
    min: [1, 'Maximum students must be at least 1']
  },
  enrolledStudents: [{
    type: mongoose.Schema.ObjectId,
    ref: 'User'
  }],
  semester: {
    type: String,
    required: [true, 'Please add semester'],
    enum: ['Fall', 'Spring', 'Summer']
  },
  year: {
    type: Number,
    required: [true, 'Please add year'],
    min: [2020, 'Year must be 2020 or later']
  },
  schedule: {
    days: [{
      type: String,
      enum: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
    }],
    startTime: String,
    endTime: String,
    room: String
  },
  prerequisites: [{
    type: mongoose.Schema.ObjectId,
    ref: 'Course'
  }],
  isActive: {
    type: Boolean,
    default: true
  },
  createdBy: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Prevent user from submitting duplicate course codes
CourseSchema.index({ code: 1 }, { unique: true });

// Virtual for assignments
CourseSchema.virtual('assignments', {
  ref: 'Assignment',
  localField: '_id',
  foreignField: 'course',
  justOne: false
});

// Enable virtuals
CourseSchema.set('toJSON', { virtuals: true });
CourseSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('Course', CourseSchema);