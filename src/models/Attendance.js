const mongoose = require('mongoose');

const AttendanceSchema = new mongoose.Schema({
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
  date: {
    type: Date,
    required: [true, 'Please add attendance date'],
    default: Date.now
  },
  status: {
    type: String,
    enum: ['present', 'absent', 'late', 'excused'],
    required: [true, 'Please add attendance status']
  },
  checkInTime: {
    type: Date
  },
  checkOutTime: {
    type: Date
  },
  notes: {
    type: String,
    maxlength: [200, 'Notes cannot be more than 200 characters']
  },
  markedBy: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: [true, 'Please add who marked attendance']
  },
  isManualEntry: {
    type: Boolean,
    default: true
  },
  location: {
    type: String,
    maxlength: [100, 'Location cannot be more than 100 characters']
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

// Compound index to prevent duplicate attendance records for same day
AttendanceSchema.index({ 
  student: 1, 
  course: 1, 
  date: 1 
}, { 
  unique: true,
  partialFilterExpression: {
    date: { $type: "date" }
  }
});

// Index for efficient queries
AttendanceSchema.index({ course: 1, date: -1 });
AttendanceSchema.index({ student: 1, date: -1 });
AttendanceSchema.index({ status: 1 });

// Update the updatedAt field before saving
AttendanceSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Set check-in time for present/late status
AttendanceSchema.pre('save', function(next) {
  if (this.isModified('status') && ['present', 'late'].includes(this.status) && !this.checkInTime) {
    this.checkInTime = Date.now();
  }
  next();
});

// Virtual for attendance duration
AttendanceSchema.virtual('duration').get(function() {
  if (this.checkInTime && this.checkOutTime) {
    return Math.round((this.checkOutTime - this.checkInTime) / (1000 * 60)); // in minutes
  }
  return null;
});

// Static method to calculate attendance percentage
AttendanceSchema.statics.calculateAttendancePercentage = async function(studentId, courseId) {
  const totalClasses = await this.countDocuments({ student: studentId, course: courseId });
  const presentClasses = await this.countDocuments({ 
    student: studentId, 
    course: courseId, 
    status: { $in: ['present', 'late'] } 
  });
  
  return totalClasses > 0 ? Math.round((presentClasses / totalClasses) * 100) : 0;
};

module.exports = mongoose.model('Attendance', AttendanceSchema);