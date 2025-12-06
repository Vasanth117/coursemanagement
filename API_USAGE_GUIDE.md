# API Usage Guide - SECE Course Management System

## ✅ Complete API Structure Created

### Files Created:
1. ✅ `api/axiosConfig.js` - Base axios instance with interceptors
2. ✅ `api/auth.js` - Authentication endpoints
3. ✅ `api/courses.js` - Course management
4. ✅ `api/assignments.js` - Assignment management
5. ✅ `api/enrollments.js` - Enrollment management
6. ✅ `api/users.js` - User management
7. ✅ `api/faculty.js` - Faculty-specific endpoints
8. ✅ `api/student.js` - Student-specific endpoints
9. ✅ `api/admin.js` - Admin-specific endpoints
10. ✅ `api/index.js` - Export all APIs

## 🚀 How to Use in Components

### 1. Authentication Example
```jsx
import { authAPI } from '../api';

// Login
const handleLogin = async (credentials) => {
  try {
    const response = await authAPI.login(credentials);
    localStorage.setItem('token', response.token);
    localStorage.setItem('user', JSON.stringify(response.user));
  } catch (error) {
    console.error('Login failed:', error);
  }
};

// Register
const handleRegister = async (userData) => {
  try {
    const response = await authAPI.register(userData);
    toast.success('Registration successful!');
  } catch (error) {
    toast.error(error.message);
  }
};
```

### 2. Faculty - Create Course
```jsx
import { facultyAPI } from '../api';

const CreateCourse = () => {
  const handleSubmit = async (formData) => {
    try {
      const response = await facultyAPI.createCourse(formData);
      toast.success('Course created successfully!');
      navigate('/faculty/courses');
    } catch (error) {
      toast.error('Failed to create course');
    }
  };
};
```

### 3. Faculty - Get Assignments
```jsx
import { facultyAPI } from '../api';
import { useState, useEffect } from 'react';

const FacultyAssignments = () => {
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAssignments = async () => {
      try {
        const data = await facultyAPI.getMyAssignments();
        setAssignments(data);
      } catch (error) {
        toast.error('Failed to load assignments');
      } finally {
        setLoading(false);
      }
    };
    
    fetchAssignments();
  }, []);
};
```

### 4. Faculty - Grade Submission
```jsx
import { facultyAPI } from '../api';

const GradeSubmission = ({ submissionId }) => {
  const handleGrade = async (gradeData) => {
    try {
      await facultyAPI.gradeSubmission(submissionId, {
        marks: gradeData.marks,
        feedback: gradeData.feedback
      });
      toast.success('Graded successfully!');
    } catch (error) {
      toast.error('Failed to grade submission');
    }
  };
};
```

### 5. Student - Submit Assignment
```jsx
import { studentAPI } from '../api';

const SubmitAssignment = ({ assignmentId }) => {
  const handleSubmit = async (file) => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('comments', 'My submission');

    try {
      await studentAPI.submitAssignment(assignmentId, formData);
      toast.success('Assignment submitted!');
    } catch (error) {
      toast.error('Submission failed');
    }
  };
};
```

### 6. Admin - User Management
```jsx
import { adminAPI } from '../api';

const UserManagement = () => {
  const [users, setUsers] = useState([]);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const data = await adminAPI.getAllUsers({ page: 1, limit: 10 });
        setUsers(data.users);
      } catch (error) {
        toast.error('Failed to load users');
      }
    };
    
    fetchUsers();
  }, []);

  const handleDeleteUser = async (userId) => {
    try {
      await adminAPI.deleteUser(userId);
      toast.success('User deleted');
      // Refresh list
    } catch (error) {
      toast.error('Failed to delete user');
    }
  };
};
```

### 7. File Upload Example
```jsx
import { facultyAPI } from '../api';

const UploadResource = ({ courseId }) => {
  const handleUpload = async (file) => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('title', 'Resource Title');
    formData.append('description', 'Resource Description');

    try {
      await facultyAPI.uploadResource(courseId, formData);
      toast.success('Resource uploaded!');
    } catch (error) {
      toast.error('Upload failed');
    }
  };
};
```

### 8. File Download Example
```jsx
import { studentAPI } from '../api';

const DownloadResource = ({ resourceId }) => {
  const handleDownload = async () => {
    try {
      const blob = await studentAPI.downloadResource(resourceId);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'resource.pdf';
      a.click();
    } catch (error) {
      toast.error('Download failed');
    }
  };
};
```

## 📋 API Endpoints Summary

### Authentication (`/api/v1/auth`)
- POST `/register` - Register new user
- POST `/login` - Login user
- POST `/logout` - Logout user
- GET `/profile` - Get current user
- PUT `/profile` - Update profile
- PUT `/change-password` - Change password
- POST `/forgot-password` - Request password reset
- POST `/reset-password` - Reset password

### Courses (`/api/v1/courses`)
- GET `/` - Get all courses
- GET `/:id` - Get course by ID
- POST `/` - Create course
- PUT `/:id` - Update course
- DELETE `/:id` - Delete course
- GET `/faculty/:id` - Get faculty courses
- GET `/enrolled` - Get enrolled courses

### Assignments (`/api/v1/assignments`)
- GET `/` - Get all assignments
- GET `/:id` - Get assignment by ID
- POST `/` - Create assignment
- PUT `/:id` - Update assignment
- DELETE `/:id` - Delete assignment
- POST `/:id/submit` - Submit assignment
- GET `/:id/submissions` - Get submissions
- PUT `/:id/submissions/:sid/grade` - Grade submission

### Faculty (`/api/v1/faculty`)
- GET `/dashboard` - Dashboard stats
- GET `/courses` - My courses
- POST `/courses` - Create course
- GET `/assignments` - My assignments
- POST `/assignments` - Create assignment
- GET `/assignments/:id/submissions` - Get submissions
- PUT `/submissions/:id/grade` - Grade submission
- POST `/courses/:id/attendance` - Mark attendance
- GET `/courses/:id/gradebook` - Get gradebook
- POST `/announcements` - Create announcement
- POST `/courses/:id/resources` - Upload resource

### Student (`/api/v1/student`)
- GET `/dashboard` - Dashboard stats
- GET `/courses` - Enrolled courses
- POST `/enroll` - Enroll in course
- GET `/assignments` - My assignments
- POST `/assignments/:id/submit` - Submit assignment
- GET `/grades` - My grades
- GET `/attendance` - My attendance
- GET `/courses/:id/resources` - Course resources
- GET `/announcements` - Announcements

### Admin (`/api/v1/admin`)
- GET `/dashboard` - Dashboard stats
- GET `/users` - All users
- POST `/users` - Create user
- PUT `/users/:id` - Update user
- DELETE `/users/:id` - Delete user
- GET `/courses` - All courses
- GET `/enrollments` - All enrollments
- GET `/reports/users` - User report
- GET `/reports/courses` - Course report
- GET `/analytics/system` - System analytics

## 🔒 Authentication

All API calls (except login/register) require JWT token:
```javascript
// Token is automatically added by axios interceptor
// Stored in localStorage as 'token'
```

## ⚠️ Error Handling

```javascript
try {
  const data = await api.someEndpoint();
  // Success
} catch (error) {
  // Error handling
  if (error.status === 401) {
    // Unauthorized - redirect to login
  } else if (error.status === 403) {
    // Forbidden - no permission
  } else if (error.status === 404) {
    // Not found
  } else {
    // Other errors
    console.error(error.message);
  }
}
```

## 🎯 Best Practices

1. **Always use try-catch** for API calls
2. **Show loading states** while fetching
3. **Display error messages** to users
4. **Handle 401 errors** (auto-logout implemented)
5. **Use toast notifications** for feedback
6. **Validate data** before sending
7. **Handle file uploads** with FormData
8. **Download files** as blobs

All APIs are ready to use! Just import and call them in your components.
