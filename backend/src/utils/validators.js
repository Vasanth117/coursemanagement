const validator = require('validator');

class Validators {
  // Email validation
  static isValidEmail(email) {
    return validator.isEmail(email);
  }

  // College email validation
  static isValidCollegeEmail(email, role = null) {
    if (!validator.isEmail(email)) return false;
    
    const domain = email.split('@')[1];
    const allowedDomains = {
      admin: ['admin.college.edu', 'college.edu'],
      faculty: ['faculty.college.edu', 'college.edu'],
      student: ['student.college.edu', 'college.edu']
    };
    
    // If no role specified, check if it's any valid college domain
    if (!role) {
      const allDomains = ['admin.college.edu', 'faculty.college.edu', 'student.college.edu', 'college.edu'];
      return allDomains.includes(domain);
    }
    
    return allowedDomains[role]?.includes(domain) || false;
  }

  // Password validation
  static isValidPassword(password) {
    return password && password.length >= 6;
  }

  // MongoDB ObjectId validation
  static isValidObjectId(id) {
    return validator.isMongoId(id);
  }

  // Phone number validation
  static isValidPhone(phone) {
    return validator.isMobilePhone(phone, 'any');
  }

  // URL validation
  static isValidUrl(url) {
    return validator.isURL(url);
  }

  // Date validation
  static isValidDate(date) {
    return validator.isISO8601(date);
  }

  // User role validation
  static isValidRole(role) {
    const validRoles = ['admin', 'faculty', 'student'];
    return validRoles.includes(role);
  }

  // Course code validation
  static isValidCourseCode(code) {
    return /^[A-Z]{2,4}\d{3,4}$/.test(code);
  }

  // Student ID validation
  static isValidStudentId(studentId) {
    return /^\d{6,10}$/.test(studentId);
  }

  // Employee ID validation
  static isValidEmployeeId(employeeId) {
    return /^EMP\d{4,6}$/.test(employeeId);
  }

  // Grade validation
  static isValidGrade(grade) {
    return typeof grade === 'number' && grade >= 0 && grade <= 100;
  }

  // Semester validation
  static isValidSemester(semester) {
    const validSemesters = ['Fall', 'Spring', 'Summer'];
    return validSemesters.includes(semester);
  }

  // Year validation
  static isValidYear(year) {
    const currentYear = new Date().getFullYear();
    return year >= 2020 && year <= currentYear + 5;
  }

  // File extension validation
  static isValidFileExtension(filename, allowedExtensions) {
    const ext = filename.split('.').pop().toLowerCase();
    return allowedExtensions.includes(ext);
  }

  // Credit hours validation
  static isValidCredits(credits) {
    return typeof credits === 'number' && credits >= 1 && credits <= 6;
  }

  // Attendance status validation
  static isValidAttendanceStatus(status) {
    const validStatuses = ['present', 'absent', 'late', 'excused'];
    return validStatuses.includes(status);
  }

  // Assignment type validation
  static isValidAssignmentType(type) {
    const validTypes = ['homework', 'quiz', 'exam', 'project', 'lab'];
    return validTypes.includes(type);
  }

  // Enrollment status validation
  static isValidEnrollmentStatus(status) {
    const validStatuses = ['pending', 'enrolled', 'completed', 'dropped', 'rejected'];
    return validStatuses.includes(status);
  }

  // Priority validation
  static isValidPriority(priority) {
    const validPriorities = ['low', 'medium', 'high', 'critical'];
    return validPriorities.includes(priority);
  }

  // Department validation
  static isValidDepartment(department) {
    const validDepartments = [
      'Computer Science', 'Mathematics', 'Physics', 'Chemistry',
      'Biology', 'English', 'History', 'Psychology', 'Business',
      'Engineering', 'Art', 'Music'
    ];
    return validDepartments.includes(department);
  }
}

module.exports = Validators;