# Redux Store Usage Guide - SECE Course Management System

## ✅ Complete Redux Store Created

### Files Created:
1. ✅ `store/slices/authSlice.js` - Authentication state
2. ✅ `store/slices/userSlice.js` - User management
3. ✅ `store/slices/courseSlice.js` - Course management
4. ✅ `store/slices/assignmentSlice.js` - Assignment management
5. ✅ `store/slices/enrollmentSlice.js` - Enrollment management
6. ✅ `store/slices/uiSlice.js` - UI state (sidebar, theme, modals)
7. ✅ `store/slices/notificationSlice.js` - Notifications
8. ✅ `store/store.js` - Store configuration
9. ✅ `store/index.js` - Export all

## 🚀 Usage Examples

### 1. Authentication

```jsx
import { useDispatch, useSelector } from 'react-redux';
import { loginUser, logout } from '../store';

const LoginPage = () => {
  const dispatch = useDispatch();
  const { user, loading, error } = useSelector((state) => state.auth);

  const handleLogin = async (credentials) => {
    try {
      await dispatch(loginUser(credentials)).unwrap();
      navigate('/dashboard');
    } catch (error) {
      toast.error(error);
    }
  };

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
  };
};
```

### 2. Courses

```jsx
import { useDispatch, useSelector } from 'react-redux';
import { fetchCourses, createCourse, updateCourse, deleteCourse } from '../store';

const CoursesPage = () => {
  const dispatch = useDispatch();
  const { courses, loading, error } = useSelector((state) => state.courses);

  useEffect(() => {
    dispatch(fetchCourses());
  }, [dispatch]);

  const handleCreate = async (courseData) => {
    try {
      await dispatch(createCourse(courseData)).unwrap();
      toast.success('Course created!');
    } catch (error) {
      toast.error(error);
    }
  };

  const handleUpdate = async (id, data) => {
    await dispatch(updateCourse({ id, data })).unwrap();
  };

  const handleDelete = async (id) => {
    await dispatch(deleteCourse(id)).unwrap();
  };
};
```

### 3. Assignments

```jsx
import { useDispatch, useSelector } from 'react-redux';
import { fetchAssignments, submitAssignment, gradeSubmission } from '../store';

const AssignmentsPage = () => {
  const dispatch = useDispatch();
  const { assignments, loading, submitting } = useSelector((state) => state.assignments);

  useEffect(() => {
    dispatch(fetchAssignments());
  }, [dispatch]);

  // Student: Submit assignment
  const handleSubmit = async (assignmentId, file) => {
    const formData = new FormData();
    formData.append('file', file);
    
    try {
      await dispatch(submitAssignment({ id: assignmentId, formData })).unwrap();
      toast.success('Submitted successfully!');
    } catch (error) {
      toast.error(error);
    }
  };

  // Faculty: Grade submission
  const handleGrade = async (assignmentId, submissionId, gradeData) => {
    try {
      await dispatch(gradeSubmission({ assignmentId, submissionId, data: gradeData })).unwrap();
      toast.success('Graded successfully!');
    } catch (error) {
      toast.error(error);
    }
  };
};
```

### 4. Enrollments

```jsx
import { useDispatch, useSelector } from 'react-redux';
import { enrollCourse, unenrollCourse, fetchStudentEnrollments } from '../store';

const EnrollmentPage = () => {
  const dispatch = useDispatch();
  const { enrollments, loading } = useSelector((state) => state.enrollments);

  useEffect(() => {
    dispatch(fetchStudentEnrollments());
  }, [dispatch]);

  const handleEnroll = async (courseId) => {
    try {
      await dispatch(enrollCourse(courseId)).unwrap();
      toast.success('Enrolled successfully!');
    } catch (error) {
      toast.error(error);
    }
  };

  const handleUnenroll = async (enrollmentId) => {
    await dispatch(unenrollCourse(enrollmentId)).unwrap();
  };
};
```

### 5. UI State

```jsx
import { useDispatch, useSelector } from 'react-redux';
import { toggleSidebar, setTheme, openModal, closeModal, showToast } from '../store';

const Layout = () => {
  const dispatch = useDispatch();
  const { sidebarOpen, theme, modal } = useSelector((state) => state.ui);

  const handleToggleSidebar = () => {
    dispatch(toggleSidebar());
  };

  const handleThemeChange = (newTheme) => {
    dispatch(setTheme(newTheme));
  };

  const handleOpenModal = (type, data) => {
    dispatch(openModal({ type, data }));
  };

  const handleCloseModal = () => {
    dispatch(closeModal());
  };

  const handleShowToast = (message, type) => {
    dispatch(showToast({ message, type }));
  };
};
```

### 6. Notifications

```jsx
import { useDispatch, useSelector } from 'react-redux';
import { fetchNotifications, markAsRead, markAllAsRead } from '../store';

const NotificationBell = () => {
  const dispatch = useDispatch();
  const { notifications, unreadCount } = useSelector((state) => state.notifications);

  useEffect(() => {
    dispatch(fetchNotifications());
  }, [dispatch]);

  const handleMarkRead = (id) => {
    dispatch(markAsRead(id));
  };

  const handleMarkAllRead = () => {
    dispatch(markAllAsRead());
  };

  return (
    <div>
      <button>
        <BellIcon />
        {unreadCount > 0 && <span>{unreadCount}</span>}
      </button>
    </div>
  );
};
```

### 7. Users (Admin)

```jsx
import { useDispatch, useSelector } from 'react-redux';
import { fetchUsers, createUser, updateUser, deleteUser } from '../store';

const UserManagement = () => {
  const dispatch = useDispatch();
  const { users, loading } = useSelector((state) => state.users);

  useEffect(() => {
    dispatch(fetchUsers({ page: 1, limit: 10 }));
  }, [dispatch]);

  const handleCreate = async (userData) => {
    await dispatch(createUser(userData)).unwrap();
  };

  const handleUpdate = async (id, data) => {
    await dispatch(updateUser({ id, data })).unwrap();
  };

  const handleDelete = async (id) => {
    await dispatch(deleteUser(id)).unwrap();
  };
};
```

## 📊 State Structure

```javascript
{
  auth: {
    user: { ... },
    token: "...",
    loading: false,
    error: null
  },
  users: {
    users: [...],
    currentUser: null,
    loading: false,
    error: null
  },
  courses: {
    courses: [...],
    enrolledCourses: [...],
    currentCourse: null,
    loading: false,
    error: null,
    filters: { search: '', department: '', semester: '' }
  },
  assignments: {
    assignments: [...],
    currentAssignment: null,
    submissions: [...],
    loading: false,
    submitting: false,
    error: null
  },
  enrollments: {
    enrollments: [...],
    courseEnrollments: [...],
    loading: false,
    error: null
  },
  ui: {
    sidebarOpen: true,
    theme: 'light',
    loading: false,
    modal: { isOpen: false, type: null, data: null },
    toast: { show: false, message: '', type: 'info' }
  },
  notifications: {
    notifications: [...],
    unreadCount: 0,
    loading: false,
    error: null
  }
}
```

## 🎯 Available Actions

### Auth Slice
- `loginUser(credentials)` - Login user
- `logout()` - Logout user
- `clearError()` - Clear auth errors

### User Slice
- `fetchUsers(params)` - Get all users
- `fetchUserById(id)` - Get user by ID
- `createUser(data)` - Create new user
- `updateUser({ id, data })` - Update user
- `deleteUser(id)` - Delete user
- `clearError()` - Clear errors

### Course Slice
- `fetchCourses(params)` - Get all courses
- `fetchCourseById(id)` - Get course by ID
- `createCourse(data)` - Create course
- `updateCourse({ id, data })` - Update course
- `deleteCourse(id)` - Delete course
- `fetchEnrolledCourses()` - Get enrolled courses
- `setFilters(filters)` - Set course filters
- `clearFilters()` - Clear filters

### Assignment Slice
- `fetchAssignments(params)` - Get assignments
- `fetchAssignmentById(id)` - Get assignment by ID
- `createAssignment(data)` - Create assignment
- `updateAssignment({ id, data })` - Update assignment
- `deleteAssignment(id)` - Delete assignment
- `submitAssignment({ id, formData })` - Submit assignment
- `fetchSubmissions(id)` - Get submissions
- `gradeSubmission({ assignmentId, submissionId, data })` - Grade submission

### Enrollment Slice
- `enrollCourse(courseId)` - Enroll in course
- `unenrollCourse(enrollmentId)` - Unenroll from course
- `fetchStudentEnrollments()` - Get student enrollments
- `fetchCourseEnrollments(courseId)` - Get course enrollments

### UI Slice
- `toggleSidebar()` - Toggle sidebar
- `setSidebarOpen(boolean)` - Set sidebar state
- `setTheme(theme)` - Set theme
- `toggleTheme()` - Toggle theme
- `setLoading(boolean)` - Set loading state
- `openModal({ type, data })` - Open modal
- `closeModal()` - Close modal
- `showToast({ message, type })` - Show toast
- `hideToast()` - Hide toast

### Notification Slice
- `fetchNotifications()` - Get notifications
- `markAsRead(id)` - Mark notification as read
- `markAllAsRead()` - Mark all as read
- `deleteNotification(id)` - Delete notification
- `addNotification(data)` - Add new notification

## 🔥 Best Practices

1. **Always use `.unwrap()`** with async thunks for error handling
2. **Use `useSelector`** to access state
3. **Use `useDispatch`** to dispatch actions
4. **Handle loading states** in UI
5. **Clear errors** after displaying
6. **Use try-catch** with async operations

All Redux slices are production-ready and integrated!
