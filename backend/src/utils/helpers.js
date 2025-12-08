const crypto = require('crypto');

class Helpers {
  // Generate random string
  static generateRandomString(length = 10) {
    return crypto.randomBytes(length).toString('hex').slice(0, length);
  }

  // Generate unique ID
  static generateUniqueId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  }

  // Format date
  static formatDate(date, format = 'YYYY-MM-DD') {
    const d = new Date(date);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    
    switch (format) {
      case 'YYYY-MM-DD':
        return `${year}-${month}-${day}`;
      case 'DD/MM/YYYY':
        return `${day}/${month}/${year}`;
      case 'MM/DD/YYYY':
        return `${month}/${day}/${year}`;
      default:
        return d.toISOString().split('T')[0];
    }
  }

  // Format time
  static formatTime(date) {
    return new Date(date).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  }

  // Calculate age
  static calculateAge(birthDate) {
    const today = new Date();
    const birth = new Date(birthDate);
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    
    return age;
  }

  // Calculate GPA
  static calculateGPA(grades) {
    if (!grades || grades.length === 0) return 0;
    
    const gradePoints = {
      'A+': 4.0, 'A': 4.0, 'A-': 3.7,
      'B+': 3.3, 'B': 3.0, 'B-': 2.7,
      'C+': 2.3, 'C': 2.0, 'C-': 1.7,
      'D+': 1.3, 'D': 1.0, 'F': 0.0
    };
    
    let totalPoints = 0;
    let totalCredits = 0;
    
    grades.forEach(grade => {
      const points = gradePoints[grade.letterGrade] || 0;
      const credits = grade.credits || 1;
      totalPoints += points * credits;
      totalCredits += credits;
    });
    
    return totalCredits > 0 ? Math.round((totalPoints / totalCredits) * 100) / 100 : 0;
  }

  // Convert percentage to letter grade
  static percentageToLetterGrade(percentage) {
    if (percentage >= 97) return 'A+';
    if (percentage >= 93) return 'A';
    if (percentage >= 90) return 'A-';
    if (percentage >= 87) return 'B+';
    if (percentage >= 83) return 'B';
    if (percentage >= 80) return 'B-';
    if (percentage >= 77) return 'C+';
    if (percentage >= 73) return 'C';
    if (percentage >= 70) return 'C-';
    if (percentage >= 67) return 'D+';
    if (percentage >= 60) return 'D';
    return 'F';
  }

  // Capitalize first letter
  static capitalize(str) {
    return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
  }

  // Convert to title case
  static toTitleCase(str) {
    return str.replace(/\w\S*/g, (txt) => 
      txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase()
    );
  }

  // Generate slug from string
  static generateSlug(str) {
    return str
      .toLowerCase()
      .replace(/[^\w ]+/g, '')
      .replace(/ +/g, '-');
  }

  // Format file size
  static formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  // Generate password
  static generatePassword(length = 8) {
    const charset = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*';
    let password = '';
    
    for (let i = 0; i < length; i++) {
      password += charset.charAt(Math.floor(Math.random() * charset.length));
    }
    
    return password;
  }

  // Mask email
  static maskEmail(email) {
    const [username, domain] = email.split('@');
    const maskedUsername = username.charAt(0) + '*'.repeat(username.length - 2) + username.charAt(username.length - 1);
    return `${maskedUsername}@${domain}`;
  }

  // Mask phone number
  static maskPhone(phone) {
    return phone.replace(/(\d{3})\d{4}(\d{3})/, '$1****$2');
  }

  // Calculate days between dates
  static daysBetween(date1, date2) {
    const oneDay = 24 * 60 * 60 * 1000;
    const firstDate = new Date(date1);
    const secondDate = new Date(date2);
    
    return Math.round(Math.abs((firstDate - secondDate) / oneDay));
  }

  // Check if date is in past
  static isDateInPast(date) {
    return new Date(date) < new Date();
  }

  // Check if date is in future
  static isDateInFuture(date) {
    return new Date(date) > new Date();
  }

  // Get semester from date
  static getSemesterFromDate(date) {
    const month = new Date(date).getMonth() + 1;
    
    if (month >= 1 && month <= 5) return 'Spring';
    if (month >= 6 && month <= 8) return 'Summer';
    return 'Fall';
  }

  // Generate course code
  static generateCourseCode(department, level = 100) {
    const deptCode = department.substring(0, 3).toUpperCase();
    const courseNumber = level + Math.floor(Math.random() * 99);
    return `${deptCode}${courseNumber}`;
  }

  // Parse query string
  static parseQueryString(queryString) {
    const params = new URLSearchParams(queryString);
    const result = {};
    
    for (const [key, value] of params) {
      result[key] = value;
    }
    
    return result;
  }

  // Deep clone object
  static deepClone(obj) {
    return JSON.parse(JSON.stringify(obj));
  }

  // Remove duplicates from array
  static removeDuplicates(arr, key = null) {
    if (key) {
      return arr.filter((item, index, self) => 
        index === self.findIndex(t => t[key] === item[key])
      );
    }
    return [...new Set(arr)];
  }

  // Group array by key
  static groupBy(arr, key) {
    return arr.reduce((groups, item) => {
      const group = item[key];
      groups[group] = groups[group] || [];
      groups[group].push(item);
      return groups;
    }, {});
  }

  // Sort array by multiple keys
  static sortBy(arr, keys) {
    return arr.sort((a, b) => {
      for (const key of keys) {
        const aVal = a[key];
        const bVal = b[key];
        
        if (aVal < bVal) return -1;
        if (aVal > bVal) return 1;
      }
      return 0;
    });
  }

  // Paginate array
  static paginate(arr, page = 1, limit = 10) {
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    
    return {
      data: arr.slice(startIndex, endIndex),
      pagination: {
        page,
        limit,
        total: arr.length,
        pages: Math.ceil(arr.length / limit)
      }
    };
  }

  // Generate QR code data
  static generateQRData(type, data) {
    return JSON.stringify({ type, data, timestamp: Date.now() });
  }

  // Validate and sanitize input
  static sanitizeInput(input) {
    if (typeof input !== 'string') return input;
    
    return input
      .trim()
      .replace(/[<>]/g, '')
      .replace(/javascript:/gi, '')
      .replace(/on\w+=/gi, '');
  }
}

module.exports = Helpers;