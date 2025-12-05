const fs = require('fs').promises;
const path = require('path');
const crypto = require('crypto');
const ErrorResponse = require('../utils/ErrorResponse');

class FileService {
  constructor() {
    this.uploadDir = path.join(process.cwd(), 'uploads');
    this.maxFileSize = 10 * 1024 * 1024; // 10MB
    this.allowedTypes = {
      image: ['jpg', 'jpeg', 'png', 'gif', 'webp'],
      document: ['pdf', 'doc', 'docx', 'txt', 'rtf'],
      presentation: ['ppt', 'pptx'],
      spreadsheet: ['xls', 'xlsx', 'csv'],
      archive: ['zip', 'rar', '7z'],
      video: ['mp4', 'avi', 'mov', 'wmv', 'flv'],
      audio: ['mp3', 'wav', 'ogg', 'aac']
    };
  }

  // Ensure upload directory exists
  async ensureUploadDir(subDir = '') {
    const fullPath = path.join(this.uploadDir, subDir);
    try {
      await fs.access(fullPath);
    } catch (error) {
      await fs.mkdir(fullPath, { recursive: true });
    }
    return fullPath;
  }

  // Generate unique filename
  generateUniqueFilename(originalName) {
    const ext = path.extname(originalName);
    const name = path.basename(originalName, ext);
    const timestamp = Date.now();
    const random = crypto.randomBytes(8).toString('hex');
    return `${name}-${timestamp}-${random}${ext}`;
  }

  // Get file extension
  getFileExtension(filename) {
    return path.extname(filename).toLowerCase().slice(1);
  }

  // Validate file type
  validateFileType(filename, allowedCategories = ['image', 'document']) {
    const ext = this.getFileExtension(filename);
    const allowedExtensions = allowedCategories.reduce((acc, category) => {
      return acc.concat(this.allowedTypes[category] || []);
    }, []);

    if (!allowedExtensions.includes(ext)) {
      throw new ErrorResponse(`File type .${ext} is not allowed`, 400);
    }
    return true;
  }

  // Validate file size
  validateFileSize(size) {
    if (size > this.maxFileSize) {
      throw new ErrorResponse(`File size exceeds maximum limit of ${this.maxFileSize / (1024 * 1024)}MB`, 400);
    }
    return true;
  }

  // Save uploaded file
  async saveFile(file, subDir = 'misc', allowedCategories = ['image', 'document']) {
    try {
      // Validate file
      this.validateFileType(file.originalname, allowedCategories);
      this.validateFileSize(file.size);

      // Ensure directory exists
      const uploadPath = await this.ensureUploadDir(subDir);

      // Generate unique filename
      const filename = this.generateUniqueFilename(file.originalname);
      const filePath = path.join(uploadPath, filename);

      // Save file
      await fs.writeFile(filePath, file.buffer);

      return {
        filename,
        originalName: file.originalname,
        path: path.join(subDir, filename),
        size: file.size,
        mimetype: file.mimetype,
        uploadedAt: new Date()
      };
    } catch (error) {
      throw new ErrorResponse(error.message || 'File upload failed', 500);
    }
  }

  // Save multiple files
  async saveMultipleFiles(files, subDir = 'misc', allowedCategories = ['image', 'document']) {
    const savedFiles = [];
    
    for (const file of files) {
      try {
        const savedFile = await this.saveFile(file, subDir, allowedCategories);
        savedFiles.push(savedFile);
      } catch (error) {
        // Clean up already saved files on error
        await this.deleteMultipleFiles(savedFiles.map(f => f.path));
        throw error;
      }
    }

    return savedFiles;
  }

  // Get file info
  async getFileInfo(filePath) {
    try {
      const fullPath = path.join(this.uploadDir, filePath);
      const stats = await fs.stat(fullPath);
      
      return {
        exists: true,
        size: stats.size,
        created: stats.birthtime,
        modified: stats.mtime,
        path: fullPath
      };
    } catch (error) {
      return { exists: false };
    }
  }

  // Read file
  async readFile(filePath) {
    try {
      const fullPath = path.join(this.uploadDir, filePath);
      const buffer = await fs.readFile(fullPath);
      return buffer;
    } catch (error) {
      throw new ErrorResponse('File not found', 404);
    }
  }

  // Delete file
  async deleteFile(filePath) {
    try {
      if (!filePath) return true;
      
      const fullPath = path.join(this.uploadDir, filePath);
      await fs.unlink(fullPath);
      return true;
    } catch (error) {
      console.error('File deletion error:', error);
      return false;
    }
  }

  // Delete multiple files
  async deleteMultipleFiles(filePaths) {
    const results = await Promise.allSettled(
      filePaths.map(filePath => this.deleteFile(filePath))
    );
    
    return results.map((result, index) => ({
      path: filePaths[index],
      deleted: result.status === 'fulfilled' && result.value
    }));
  }

  // Move file
  async moveFile(oldPath, newPath) {
    try {
      const oldFullPath = path.join(this.uploadDir, oldPath);
      const newFullPath = path.join(this.uploadDir, newPath);
      
      // Ensure destination directory exists
      await this.ensureUploadDir(path.dirname(newPath));
      
      await fs.rename(oldFullPath, newFullPath);
      return newPath;
    } catch (error) {
      throw new ErrorResponse('File move failed', 500);
    }
  }

  // Copy file
  async copyFile(sourcePath, destPath) {
    try {
      const sourceFullPath = path.join(this.uploadDir, sourcePath);
      const destFullPath = path.join(this.uploadDir, destPath);
      
      // Ensure destination directory exists
      await this.ensureUploadDir(path.dirname(destPath));
      
      await fs.copyFile(sourceFullPath, destFullPath);
      return destPath;
    } catch (error) {
      throw new ErrorResponse('File copy failed', 500);
    }
  }

  // Get file URL
  getFileUrl(filePath) {
    if (!filePath) return null;
    return `${process.env.BASE_URL}/uploads/${filePath}`;
  }

  // Format file size
  formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  // Get file type category
  getFileCategory(filename) {
    const ext = this.getFileExtension(filename);
    
    for (const [category, extensions] of Object.entries(this.allowedTypes)) {
      if (extensions.includes(ext)) {
        return category;
      }
    }
    
    return 'unknown';
  }

  // Clean up old files (older than specified days)
  async cleanupOldFiles(days = 30, subDir = '') {
    try {
      const targetDir = path.join(this.uploadDir, subDir);
      const files = await fs.readdir(targetDir);
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - days);
      
      let deletedCount = 0;
      
      for (const file of files) {
        const filePath = path.join(targetDir, file);
        const stats = await fs.stat(filePath);
        
        if (stats.mtime < cutoffDate) {
          await fs.unlink(filePath);
          deletedCount++;
        }
      }
      
      return { deletedCount, message: `Cleaned up ${deletedCount} old files` };
    } catch (error) {
      throw new ErrorResponse('Cleanup failed', 500);
    }
  }

  // Get directory size
  async getDirectorySize(subDir = '') {
    try {
      const targetDir = path.join(this.uploadDir, subDir);
      const files = await fs.readdir(targetDir);
      let totalSize = 0;
      
      for (const file of files) {
        const filePath = path.join(targetDir, file);
        const stats = await fs.stat(filePath);
        if (stats.isFile()) {
          totalSize += stats.size;
        }
      }
      
      return {
        bytes: totalSize,
        formatted: this.formatFileSize(totalSize),
        fileCount: files.length
      };
    } catch (error) {
      return { bytes: 0, formatted: '0 Bytes', fileCount: 0 };
    }
  }
}

module.exports = new FileService();