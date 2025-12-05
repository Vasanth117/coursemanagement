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
    enum: ['document', 'video', 'audio', 'image', 'link', 'presentation', 'spreadsheet'],
    required: [true, 'Please add resource type']
  },
  category: {
    type: String,
    enum: ['lecture', 'reading', 'assignment', 'reference', 'supplementary', 'exam'],
    default: 'lecture'
  },
  file: {
    filename: String,
    originalName: String,
    path: String,
    size: Number,
    mimetype: String
  },
  url: {
    type: String,
    validate: {
      validator: function(v) {
        return this.type === 'link' ? !!v : true;
      },
      message: 'URL is required for link type resources'
    }
  },
  isPublic: {
    type: Boolean,
    default: false
  },
  accessLevel: {
    type: String,
    enum: ['public', 'enrolled', 'faculty'],
    default: 'enrolled'
  },
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
});

// Index for efficient queries
ResourceSchema.index({ course: 1, category: 1 });
ResourceSchema.index({ type: 1 });
ResourceSchema.index({ accessLevel: 1 });
ResourceSchema.index({ tags: 1 });
ResourceSchema.index({ createdAt: -1 });

// Update the updatedAt field before saving
ResourceSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Virtual for file size in readable format
ResourceSchema.virtual('fileSizeFormatted').get(function() {
  if (!this.file || !this.file.size) return null;
  
  const bytes = this.file.size;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  if (bytes === 0) return '0 Bytes';
  
  const i = parseInt(Math.floor(Math.log(bytes) / Math.log(1024)));
  return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
});

module.exports = mongoose.model('Resource', ResourceSchema);