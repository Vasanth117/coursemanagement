const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const path = require('path');

/**
 * Configure Cloudinary using environment variables for security.
 * The required parameters (cloud_name, api_key, api_secret) must be set in your .env file[citation:2][citation:7].
 */
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true, // Always deliver assets over HTTPS
});

/**
 * Validate that essential configuration is present on server start.
 */
const validateConfig = () => {
  const required = ['CLOUDINARY_CLOUD_NAME', 'CLOUDINARY_API_KEY', 'CLOUDINARY_API_SECRET'];
  const missing = required.filter(key => !process.env[key]);

  if (missing.length) {
    console.error('❌ Cloudinary Configuration Error:'.red);
    console.error(`Missing environment variables: ${missing.join(', ')}`.yellow);
    console.error('Please check your .env file.'.yellow);
    // In production, you might want to throw an error or exit
    // throw new Error('Cloudinary configuration is incomplete');
  } else {
    console.log('✅ Cloudinary configuration loaded successfully.'.green);
  }
};

// Run validation when this module is loaded
validateConfig();

/**
 * Helper function to determine the Cloudinary folder based on the file type and user role.
 * This helps organize uploaded files in your Cloudinary Media Library.
 * @param {Object} req - The Express request object.
 * @returns {String} The folder path.
 */
const getUploadFolder = (req) => {
  const baseFolder = 'course_management_system';

  // Determine folder by the type of upload (you can customize this based on your routes)
  if (req.baseUrl.includes('assignments')) {
    return `${baseFolder}/assignments`;
  } else if (req.baseUrl.includes('submissions')) {
    return `${baseFolder}/submissions/course_${req.body.courseId || 'general'}`;
  } else if (req.baseUrl.includes('profiles')) {
    // Organize profile pictures by user role
    const userRole = req.user?.role || 'general';
    return `${baseFolder}/profiles/${userRole}`;
  } else if (req.baseUrl.includes('resources')) {
    return `${baseFolder}/resources`;
  }
  return `${baseFolder}/misc`;
};

/**
 * Configuration for Multer storage engine that uploads directly to Cloudinary.
 * This setup avoids saving files to your server's disk[citation:7].
 */
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: async (req, file) => {
    // Define allowed formats for security
    const allowedImageFormats = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'bmp'];
    const allowedDocumentFormats = ['pdf', 'doc', 'docx', 'txt'];
    const allowedVideoFormats = ['mp4', 'mov', 'avi', 'mkv'];
    const allAllowedFormats = [...allowedImageFormats, ...allowedDocumentFormats, ...allowedVideoFormats];

    // Extract file extension
    const fileExt = path.extname(file.originalname).toLowerCase().replace('.', '');

    // Validate file format
    if (!allAllowedFormats.includes(fileExt)) {
      // This error will be caught by Multer's fileFilter
      throw new Error(`File type .${fileExt} is not permitted.`);
    }

    // Determine resource type for Cloudinary (affects how the file is processed)
    let resourceType = 'auto'; // Cloudinary will detect the type
    if (allowedImageFormats.includes(fileExt)) {
      resourceType = 'image';
    } else if (allowedVideoFormats.includes(fileExt)) {
      resourceType = 'video';
    }

    // Create a unique public_id to avoid overwriting files
    const timestamp = Date.now();
    const randomString = Math.random().toString(36).substring(2, 8);
    const fileName = file.originalname.replace(/\.[^/.]+$/, ""); // Remove extension
    const safeFileName = fileName.replace(/[^a-z0-9]/gi, '_').toLowerCase();
    const publicId = `${safeFileName}_${timestamp}_${randomString}`;

    return {
      folder: getUploadFolder(req),
      allowed_formats: allAllowedFormats,
      resource_type: resourceType,
      public_id: publicId, // Unique identifier for the file in Cloudinary[citation:1]
      // Optional: Apply transformations on upload (e.g., resize profile pictures)
      ...(req.baseUrl.includes('profiles') && {
        transformation: [
          { width: 500, height: 500, crop: 'fill', gravity: 'face' }
        ]
      }),
      // Optional: Tag files for easier management (e.g., by course ID or user ID)
      tags: [`user_${req.user?.id || 'anonymous'}`, `upload_${timestamp}`],
    };
  },
});

/**
 * Utility function for direct uploads (useful in controllers).
 * @param {String | Buffer} file - The file path in server uploads/ folder or a buffer.
 * @param {Object} options - Additional Cloudinary upload options.
 * @returns {Promise<Object>} The Cloudinary upload result.
 */
const uploadToCloudinary = async (file, options = {}) => {
  try {
    const uploadOptions = {
      resource_type: 'auto',
      folder: 'course_management_system/uploads',
      ...options,
    };

    // If file is a Buffer (from multer.memoryStorage), use upload_stream
    if (Buffer.isBuffer(file)) {
      return new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
          uploadOptions,
          (error, result) => {
            if (error) reject(error);
            else resolve(result);
          }
        );
        uploadStream.end(file);
      });
    }

    // If file is a string path, use the standard upload method
    const result = await cloudinary.uploader.upload(file, uploadOptions);
    return result;
  } catch (error) {
    console.error('Cloudinary upload error:', error);
    throw new Error(`Failed to upload file to Cloudinary: ${error.message}`);
  }
};

/**
 * Utility function to delete a file from Cloudinary using its public ID.
 * @param {String} publicId - The public_id of the file to delete.
 * @param {Object} options - Options like resource_type.
 * @returns {Promise<Object>} The deletion result.
 */
const deleteFromCloudinary = async (publicId, options = {}) => {
  try {
    const deleteOptions = { resource_type: 'image', ...options };
    const result = await cloudinary.uploader.destroy(publicId, deleteOptions);
    return result;
  } catch (error) {
    console.error('Cloudinary delete error:', error);
    throw new Error(`Failed to delete file from Cloudinary: ${error.message}`);
  }
};

module.exports = {
  cloudinary,
  storage, // For use with Multer: `multer({ storage: storage })`
  uploadToCloudinary, // For manual uploads in controllers
  deleteFromCloudinary, // For cleaning up files
  validateConfig,
};