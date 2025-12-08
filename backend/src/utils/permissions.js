const { USER_ROLES } = require('./constants');

// Permission definitions
const PERMISSIONS = {
  // User management
  USER_CREATE: 'user:create',
  USER_READ: 'user:read',
  USER_UPDATE: 'user:update',
  USER_DELETE: 'user:delete',
  USER_LIST: 'user:list',

  // Course management
  COURSE_CREATE: 'course:create',
  COURSE_READ: 'course:read',
  COURSE_UPDATE: 'course:update',
  COURSE_DELETE: 'course:delete',
  COURSE_LIST: 'course:list',
  COURSE_MANAGE: 'course:manage',

  // Enrollment management
  ENROLLMENT_CREATE: 'enrollment:create',
  ENROLLMENT_READ: 'enrollment:read',
  ENROLLMENT_UPDATE: 'enrollment:update',
  ENROLLMENT_DELETE: 'enrollment:delete',
  ENROLLMENT_LIST: 'enrollment:list',
  ENROLLMENT_APPROVE: 'enrollment:approve',
  ENROLLMENT_REJECT: 'enrollment:reject',

  // Assignment management
  ASSIGNMENT_CREATE: 'assignment:create',
  ASSIGNMENT_READ: 'assignment:read',
  ASSIGNMENT_UPDATE: 'assignment:update',
  ASSIGNMENT_DELETE: 'assignment:delete',
  ASSIGNMENT_LIST: 'assignment:list',
  ASSIGNMENT_PUBLISH: 'assignment:publish',

  // Submission management
  SUBMISSION_CREATE: 'submission:create',
  SUBMISSION_READ: 'submission:read',
  SUBMISSION_UPDATE: 'submission:update',
  SUBMISSION_DELETE: 'submission:delete',
  SUBMISSION_LIST: 'submission:list',
  SUBMISSION_GRADE: 'submission:grade',

  // Grade management
  GRADE_CREATE: 'grade:create',
  GRADE_READ: 'grade:read',
  GRADE_UPDATE: 'grade:update',
  GRADE_DELETE: 'grade:delete',
  GRADE_LIST: 'grade:list',

  // Attendance management
  ATTENDANCE_CREATE: 'attendance:create',
  ATTENDANCE_READ: 'attendance:read',
  ATTENDANCE_UPDATE: 'attendance:update',
  ATTENDANCE_DELETE: 'attendance:delete',
  ATTENDANCE_LIST: 'attendance:list',

  // Announcement management
  ANNOUNCEMENT_CREATE: 'announcement:create',
  ANNOUNCEMENT_READ: 'announcement:read',
  ANNOUNCEMENT_UPDATE: 'announcement:update',
  ANNOUNCEMENT_DELETE: 'announcement:delete',
  ANNOUNCEMENT_LIST: 'announcement:list',
  ANNOUNCEMENT_PUBLISH: 'announcement:publish',

  // Resource management
  RESOURCE_CREATE: 'resource:create',
  RESOURCE_READ: 'resource:read',
  RESOURCE_UPDATE: 'resource:update',
  RESOURCE_DELETE: 'resource:delete',
  RESOURCE_LIST: 'resource:list',
  RESOURCE_DOWNLOAD: 'resource:download',

  // System management
  SYSTEM_ADMIN: 'system:admin',
  SYSTEM_ANALYTICS: 'system:analytics',
  SYSTEM_REPORTS: 'system:reports',
  SYSTEM_SETTINGS: 'system:settings'
};

// Role-based permissions
const ROLE_PERMISSIONS = {
  [USER_ROLES.ADMIN]: [
    // Full system access
    PERMISSIONS.USER_CREATE,
    PERMISSIONS.USER_READ,
    PERMISSIONS.USER_UPDATE,
    PERMISSIONS.USER_DELETE,
    PERMISSIONS.USER_LIST,
    
    PERMISSIONS.COURSE_CREATE,
    PERMISSIONS.COURSE_READ,
    PERMISSIONS.COURSE_UPDATE,
    PERMISSIONS.COURSE_DELETE,
    PERMISSIONS.COURSE_LIST,
    PERMISSIONS.COURSE_MANAGE,
    
    PERMISSIONS.ENROLLMENT_CREATE,
    PERMISSIONS.ENROLLMENT_READ,
    PERMISSIONS.ENROLLMENT_UPDATE,
    PERMISSIONS.ENROLLMENT_DELETE,
    PERMISSIONS.ENROLLMENT_LIST,
    PERMISSIONS.ENROLLMENT_APPROVE,
    PERMISSIONS.ENROLLMENT_REJECT,
    
    PERMISSIONS.ASSIGNMENT_CREATE,
    PERMISSIONS.ASSIGNMENT_READ,
    PERMISSIONS.ASSIGNMENT_UPDATE,
    PERMISSIONS.ASSIGNMENT_DELETE,
    PERMISSIONS.ASSIGNMENT_LIST,
    PERMISSIONS.ASSIGNMENT_PUBLISH,
    
    PERMISSIONS.SUBMISSION_CREATE,
    PERMISSIONS.SUBMISSION_READ,
    PERMISSIONS.SUBMISSION_UPDATE,
    PERMISSIONS.SUBMISSION_DELETE,
    PERMISSIONS.SUBMISSION_LIST,
    PERMISSIONS.SUBMISSION_GRADE,
    
    PERMISSIONS.GRADE_CREATE,
    PERMISSIONS.GRADE_READ,
    PERMISSIONS.GRADE_UPDATE,
    PERMISSIONS.GRADE_DELETE,
    PERMISSIONS.GRADE_LIST,
    
    PERMISSIONS.ATTENDANCE_CREATE,
    PERMISSIONS.ATTENDANCE_READ,
    PERMISSIONS.ATTENDANCE_UPDATE,
    PERMISSIONS.ATTENDANCE_DELETE,
    PERMISSIONS.ATTENDANCE_LIST,
    
    PERMISSIONS.ANNOUNCEMENT_CREATE,
    PERMISSIONS.ANNOUNCEMENT_READ,
    PERMISSIONS.ANNOUNCEMENT_UPDATE,
    PERMISSIONS.ANNOUNCEMENT_DELETE,
    PERMISSIONS.ANNOUNCEMENT_LIST,
    PERMISSIONS.ANNOUNCEMENT_PUBLISH,
    
    PERMISSIONS.RESOURCE_CREATE,
    PERMISSIONS.RESOURCE_READ,
    PERMISSIONS.RESOURCE_UPDATE,
    PERMISSIONS.RESOURCE_DELETE,
    PERMISSIONS.RESOURCE_LIST,
    PERMISSIONS.RESOURCE_DOWNLOAD,
    
    PERMISSIONS.SYSTEM_ADMIN,
    PERMISSIONS.SYSTEM_ANALYTICS,
    PERMISSIONS.SYSTEM_REPORTS,
    PERMISSIONS.SYSTEM_SETTINGS
  ],

  [USER_ROLES.FACULTY]: [
    // Course and student management
    PERMISSIONS.COURSE_READ,
    PERMISSIONS.COURSE_UPDATE, // Own courses only
    PERMISSIONS.COURSE_LIST,
    PERMISSIONS.COURSE_MANAGE, // Own courses only
    
    PERMISSIONS.ENROLLMENT_READ,
    PERMISSIONS.ENROLLMENT_UPDATE, // Own courses only
    PERMISSIONS.ENROLLMENT_LIST,
    PERMISSIONS.ENROLLMENT_APPROVE, // Own courses only
    PERMISSIONS.ENROLLMENT_REJECT, // Own courses only
    
    PERMISSIONS.ASSIGNMENT_CREATE, // Own courses only
    PERMISSIONS.ASSIGNMENT_READ,
    PERMISSIONS.ASSIGNMENT_UPDATE, // Own assignments only
    PERMISSIONS.ASSIGNMENT_DELETE, // Own assignments only
    PERMISSIONS.ASSIGNMENT_LIST,
    PERMISSIONS.ASSIGNMENT_PUBLISH, // Own assignments only
    
    PERMISSIONS.SUBMISSION_READ, // Own courses only
    PERMISSIONS.SUBMISSION_LIST, // Own courses only
    PERMISSIONS.SUBMISSION_GRADE, // Own courses only
    
    PERMISSIONS.GRADE_CREATE, // Own courses only
    PERMISSIONS.GRADE_READ, // Own courses only
    PERMISSIONS.GRADE_UPDATE, // Own courses only
    PERMISSIONS.GRADE_DELETE, // Own courses only
    PERMISSIONS.GRADE_LIST, // Own courses only
    
    PERMISSIONS.ATTENDANCE_CREATE, // Own courses only
    PERMISSIONS.ATTENDANCE_READ, // Own courses only
    PERMISSIONS.ATTENDANCE_UPDATE, // Own courses only
    PERMISSIONS.ATTENDANCE_DELETE, // Own courses only
    PERMISSIONS.ATTENDANCE_LIST, // Own courses only
    
    PERMISSIONS.ANNOUNCEMENT_CREATE, // Own courses only
    PERMISSIONS.ANNOUNCEMENT_READ,
    PERMISSIONS.ANNOUNCEMENT_UPDATE, // Own announcements only
    PERMISSIONS.ANNOUNCEMENT_DELETE, // Own announcements only
    PERMISSIONS.ANNOUNCEMENT_LIST,
    PERMISSIONS.ANNOUNCEMENT_PUBLISH, // Own announcements only
    
    PERMISSIONS.RESOURCE_CREATE, // Own courses only
    PERMISSIONS.RESOURCE_READ,
    PERMISSIONS.RESOURCE_UPDATE, // Own resources only
    PERMISSIONS.RESOURCE_DELETE, // Own resources only
    PERMISSIONS.RESOURCE_LIST,
    PERMISSIONS.RESOURCE_DOWNLOAD
  ],

  [USER_ROLES.STUDENT]: [
    // Limited access to own data and enrolled courses
    PERMISSIONS.COURSE_READ, // Enrolled courses only
    PERMISSIONS.COURSE_LIST,
    
    PERMISSIONS.ENROLLMENT_READ, // Own enrollments only
    PERMISSIONS.ENROLLMENT_LIST, // Own enrollments only
    
    PERMISSIONS.ASSIGNMENT_READ, // Enrolled courses only
    PERMISSIONS.ASSIGNMENT_LIST, // Enrolled courses only
    
    PERMISSIONS.SUBMISSION_CREATE, // Own submissions only
    PERMISSIONS.SUBMISSION_READ, // Own submissions only
    PERMISSIONS.SUBMISSION_UPDATE, // Own submissions only
    PERMISSIONS.SUBMISSION_DELETE, // Own submissions only
    PERMISSIONS.SUBMISSION_LIST, // Own submissions only
    
    PERMISSIONS.GRADE_READ, // Own grades only
    PERMISSIONS.GRADE_LIST, // Own grades only
    
    PERMISSIONS.ATTENDANCE_READ, // Own attendance only
    PERMISSIONS.ATTENDANCE_LIST, // Own attendance only
    
    PERMISSIONS.ANNOUNCEMENT_READ,
    PERMISSIONS.ANNOUNCEMENT_LIST,
    
    PERMISSIONS.RESOURCE_READ, // Enrolled courses only
    PERMISSIONS.RESOURCE_LIST, // Enrolled courses only
    PERMISSIONS.RESOURCE_DOWNLOAD // Enrolled courses only
  ]
};

class PermissionManager {
  // Check if user has permission
  static hasPermission(userRole, permission) {
    const rolePermissions = ROLE_PERMISSIONS[userRole] || [];
    return rolePermissions.includes(permission);
  }

  // Check multiple permissions (user must have all)
  static hasAllPermissions(userRole, permissions) {
    return permissions.every(permission => 
      this.hasPermission(userRole, permission)
    );
  }

  // Check multiple permissions (user must have at least one)
  static hasAnyPermission(userRole, permissions) {
    return permissions.some(permission => 
      this.hasPermission(userRole, permission)
    );
  }

  // Get all permissions for a role
  static getRolePermissions(userRole) {
    return ROLE_PERMISSIONS[userRole] || [];
  }

  // Check if user can access resource
  static canAccessResource(user, resource, permission, resourceOwnerId = null) {
    // Admin can access everything
    if (user.role === USER_ROLES.ADMIN) {
      return this.hasPermission(user.role, permission);
    }

    // Check basic permission
    if (!this.hasPermission(user.role, permission)) {
      return false;
    }

    // For faculty, check if they own the resource or it's related to their courses
    if (user.role === USER_ROLES.FACULTY) {
      // If resource has an owner, check ownership
      if (resourceOwnerId) {
        return user._id.toString() === resourceOwnerId.toString();
      }
      // Additional course-specific checks would go here
      return true;
    }

    // For students, check if they own the resource or are enrolled in related course
    if (user.role === USER_ROLES.STUDENT) {
      // If resource has an owner, check ownership
      if (resourceOwnerId) {
        return user._id.toString() === resourceOwnerId.toString();
      }
      // Additional enrollment-specific checks would go here
      return true;
    }

    return false;
  }

  // Check course-specific permissions
  static canAccessCourse(user, courseId, facultyId = null) {
    // Admin can access all courses
    if (user.role === USER_ROLES.ADMIN) {
      return true;
    }

    // Faculty can access their own courses
    if (user.role === USER_ROLES.FACULTY) {
      return facultyId && user._id.toString() === facultyId.toString();
    }

    // Students can access courses they're enrolled in
    // This would typically check enrollment status
    if (user.role === USER_ROLES.STUDENT) {
      // Additional enrollment check would be needed here
      return true;
    }

    return false;
  }

  // Generate permission middleware
  static requirePermission(permission) {
    return (req, res, next) => {
      if (!req.user) {
        return res.status(401).json({
          success: false,
          error: 'Authentication required'
        });
      }

      if (!this.hasPermission(req.user.role, permission)) {
        return res.status(403).json({
          success: false,
          error: 'Insufficient permissions'
        });
      }

      next();
    };
  }

  // Generate multiple permission middleware
  static requireAllPermissions(permissions) {
    return (req, res, next) => {
      if (!req.user) {
        return res.status(401).json({
          success: false,
          error: 'Authentication required'
        });
      }

      if (!this.hasAllPermissions(req.user.role, permissions)) {
        return res.status(403).json({
          success: false,
          error: 'Insufficient permissions'
        });
      }

      next();
    };
  }

  // Generate any permission middleware
  static requireAnyPermission(permissions) {
    return (req, res, next) => {
      if (!req.user) {
        return res.status(401).json({
          success: false,
          error: 'Authentication required'
        });
      }

      if (!this.hasAnyPermission(req.user.role, permissions)) {
        return res.status(403).json({
          success: false,
          error: 'Insufficient permissions'
        });
      }

      next();
    };
  }
}

module.exports = {
  PERMISSIONS,
  ROLE_PERMISSIONS,
  PermissionManager
};