const multer = require('multer');
const path = require('path');
const ErrorResponse = require('../utils/ErrorResponse');

// Configure storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    let uploadPath = 'uploads/';
    
    // Determine upload path based on file type
    if (file.fieldname === 'profileImage') {
      uploadPath += 'profiles/';
    } else if (file.fieldname === 'assignment') {
      uploadPath += 'assignments/';
    } else if (file.fieldname === 'submission') {
      uploadPath += 'submissions/';
    } else if (file.fieldname === 'resource' || file.fieldname === 'resources' || file.fieldname === 'files') {
      uploadPath += 'resources/';
    } else {
      uploadPath += 'misc/';
    }
    
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

// File filter
const fileFilter = (req, file, cb) => {
  // Allowed file types
  const allowedTypes = {
    profileImage: /jpeg|jpg|png|gif/,
    assignment: /pdf|doc|docx|txt|zip|rar/,
    submission: /pdf|doc|docx|txt|zip|rar|jpg|jpeg|png/,
    resource: /pdf|doc|docx|ppt|pptx|txt|zip|rar|jpg|jpeg|png|mp4|avi|mov/,
    resources: /pdf|doc|docx|ppt|pptx|txt|zip|rar|jpg|jpeg|png|mp4|avi|mov/,
    files: /pdf|doc|docx|ppt|pptx|txt|zip|rar|jpg|jpeg|png|mp4|avi|mov/
  };

  const fileType = allowedTypes[file.fieldname] || /pdf|doc|docx|txt|jpg|jpeg|png/;
  const extname = fileType.test(path.extname(file.originalname).toLowerCase());
  const mimetype = fileType.test(file.mimetype);

  if (mimetype && extname) {
    return cb(null, true);
  } else {
    cb(new ErrorResponse(`Invalid file type for field ${file.fieldname}`, 400));
  }
};

// Configure multer
const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 50 * 1024 * 1024 // Increased to 50MB to match frontend expectation
  }
});

// Export the upload instance
exports.upload = upload;

// Middleware for different upload types
exports.uploadProfileImage = upload.single('profileImage');
exports.uploadAssignment = upload.single('assignment');
exports.uploadSubmission = upload.single('submission');
exports.uploadResource = upload.array('files', 10); // Match frontend field name 'files' and support multiple
exports.uploadMultipleResources = upload.array('files', 10);

// Error handling middleware for multer
exports.handleUploadError = (err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return next(new ErrorResponse('File too large. Maximum size is 50MB', 400));
    }
    if (err.code === 'LIMIT_FILE_COUNT') {
      return next(new ErrorResponse('Too many files. Maximum is 10 files', 400));
    }
    if (err.code === 'LIMIT_UNEXPECTED_FILE') {
      return next(new ErrorResponse(`Unexpected field: ${err.field}. Please use 'files' for resources.`, 400));
    }
  }
  next(err);
};