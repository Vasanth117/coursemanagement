const mongoose = require('mongoose');

const ResourceSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Please add a resource title'],
    trim: true,
    maxlength: [100, 'Title cannot be more than 100 characters']
  },
  description: {
    type: String,
    maxlength: [500, 'Description cannot be more than 500 characters']
  },
  course: {
    type: mongoose.Schema.ObjectId,
    ref: 'Course',
    required: [true, 'Please add a course']
  },
  type: {
    type: String,
    enum: ['document', 'video', 'audio', 'image', 'link', 'presentation', 'spreadsheet', 'lecture', 'assignment', 'reference', 'other'],
    default: 'document'
  },
  files: [{
    name: String,
    url: String,
    size: Number,
    mimeType: String,
    publicId: String,
    uploadedAt: {
      type: Date,
      default: Date.now
    }
  }],
  // For backwards compatibility or single file if still used
  fileUrl: String,
  fileName: String,
  fileSize: Number,
  mimeType: String,
  publicId: String,
  
  downloadCount: {
    type: Number,
    default: 0
  },
  viewCount: {
    type: Number,
    default: 0
  },
  tags: [{
    type: String,
    trim: true,
    lowercase: true
  }],
  uploadedBy: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: [true, 'Please add uploader']
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Update the updatedAt field before saving
ResourceSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Virtual for file size in readable format
ResourceSchema.virtual('totalSizeFormatted').get(function() {
  const totalBytes = this.files && this.files.length > 0 
    ? this.files.reduce((sum, f) => sum + (f.size || 0), 0)
    : (this.fileSize || 0);

  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  if (totalBytes === 0) return '0 Bytes';
  
  const i = parseInt(Math.floor(Math.log(totalBytes) / Math.log(1024)));
  return Math.round(totalBytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
});

module.exports = mongoose.model('Resource', ResourceSchema);