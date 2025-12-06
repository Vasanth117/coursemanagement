# Contexts, Hooks & Utils - Complete Implementation

## ✅ All Files Created with Backend Integration

### 📁 Contexts (3 files)

#### 1. AuthContext.jsx
**Features**:
- User authentication state management
- Login/logout functionality
- User data persistence in localStorage
- Auto-load user on app start
- Update user profile

**Usage**:
```jsx
import { useAuth } from '../hooks/useAuth';

const { user, login, logout, isAuthenticated } = useAuth();
```

#### 2. ThemeContext.jsx
**Features**:
- Light/dark theme toggle
- Theme persistence in localStorage
- Auto-apply theme on load

**Usage**:
```jsx
import { useContext } from 'react';
import { ThemeContext } from '../contexts';

const { theme, toggleTheme } = useContext(ThemeContext);
```

#### 3. NotificationContext.jsx
**Features**:
- Real-time notification fetching
- Unread count tracking
- Mark as read functionality
- Auto-refresh every 60 seconds
- Backend integration with studentAPI

**Usage**:
```jsx
import { useContext } from 'react';
import { NotificationContext } from '../contexts';

const { notifications, unreadCount, markAsRead } = useContext(NotificationContext);
```

---

### 🎣 Hooks (7 files)

#### 1. useAuth.js
Custom hook to access AuthContext

#### 2. useLocalStorage.js
**Features**:
- Store/retrieve data from localStorage
- JSON serialization/deserialization
- Error handling

**Usage**:
```jsx
const [value, setValue] = useLocalStorage('key', initialValue);
```

#### 3. useApi.js
**Features**:
- Generic API call wrapper
- Loading, error, data states
- Execute function for API calls

**Usage**:
```jsx
const { data, loading, error, execute } = useApi(apiFunc);
await execute(params);
```

#### 4. useRole.js
**Features**:
- Role-based access control
- Check user role
- Helper functions: isAdmin, isFaculty, isStudent

**Usage**:
```jsx
const { hasRole, isAdmin, isFaculty, isStudent } = useRole();
```

#### 5. useCourses.js
**Features**:
- Fetch courses based on role
- Create/update course mutations
- React Query integration
- Toast notifications

**Usage**:
```jsx
const { courses, isLoading, createCourse, updateCourse } = useCourses();
```

#### 6. useAssignments.js
**Features**:
- Fetch assignments based on role
- Create assignment (faculty)
- Submit assignment (student)
- React Query integration

**Usage**:
```jsx
const { assignments, isLoading, createAssignment, submitAssignment } = useAssignments();
```

#### 7. useForm.js
**Features**:
- Form state management
- Validation support
- Error tracking
- Touch tracking
- Reset functionality

**Usage**:
```jsx
const { values, errors, handleChange, handleSubmit } = useForm(initialValues, validate);
```

---

### 🛠️ Utils (10 files)

#### Constants (5 files)

**1. roles.js**
- ROLES object (ADMIN, FACULTY, STUDENT)
- ROLE_LABELS for display
- ROLE_ROUTES for navigation

**2. routes.js**
- AUTH_ROUTES
- ADMIN_ROUTES (9 routes)
- FACULTY_ROUTES (17 routes)
- STUDENT_ROUTES (13 routes)

**3. apiEndpoints.js**
- API_BASE_URL
- AUTH_ENDPOINTS
- COURSE_ENDPOINTS
- ASSIGNMENT_ENDPOINTS
- ADMIN_ENDPOINTS
- FACULTY_ENDPOINTS
- STUDENT_ENDPOINTS

**4. permissions.js**
- PERMISSIONS matrix
- hasPermission function
- Role-based access control

**5. validationRules.js**
- Regex patterns for validation
- Validation functions:
  - validateEmail
  - validatePhone
  - validatePassword
  - validateName
  - validateCourseCode
  - validateRollNumber

#### Utility Functions (5 files)

**1. helpers.js**
- getInitials(name)
- truncateText(text, maxLength)
- debounce(func, delay)
- generateId()
- groupBy(array, key)
- sortBy(array, key, order)
- calculatePercentage(value, total)
- getFileExtension(filename)
- formatFileSize(bytes)

**2. validators.js**
- validateLoginForm(values)
- validateRegisterForm(values)
- validateCourseForm(values)
- validateAssignmentForm(values)
- validateProfileForm(values)

**3. formatters.js**
- formatDate(date)
- formatDateTime(date)
- formatTime(date)
- formatCurrency(amount)
- formatNumber(num)
- formatGrade(grade)
- formatPercentage(value, total)
- formatDuration(minutes)
- formatRelativeTime(date)

**4. storage.js**
- storage.get(key)
- storage.set(key, value)
- storage.remove(key)
- storage.clear()
- Token helpers: getToken, setToken, removeToken
- User helpers: getUser, setUser, removeUser
- Theme helpers: getTheme, setTheme

**5. roleUtils.js**
- getRoleRoute(role)
- canAccessRoute(userRole, requiredRoles)
- canPerformAction(userRole, action)
- isAdmin(role)
- isFaculty(role)
- isStudent(role)
- getRoleColor(role)
- getRoleIcon(role)

---

## 📂 File Structure

```
frontend/src/
├── contexts/
│   ├── AuthContext.jsx
│   ├── ThemeContext.jsx
│   ├── NotificationContext.jsx
│   └── index.js
├── hooks/
│   ├── useAuth.js
│   ├── useLocalStorage.js
│   ├── useApi.js
│   ├── useRole.js
│   ├── useCourses.js
│   ├── useAssignments.js
│   ├── useForm.js
│   └── index.js
└── utils/
    ├── constants/
    │   ├── roles.js
    │   ├── routes.js
    │   ├── apiEndpoints.js
    │   ├── permissions.js
    │   └── validationRules.js
    ├── helpers.js
    ├── validators.js
    ├── formatters.js
    ├── storage.js
    ├── roleUtils.js
    └── index.js
```

---

## 🚀 Usage Examples

### 1. Using AuthContext in Component
```jsx
import { useAuth } from '../hooks/useAuth';

const MyComponent = () => {
  const { user, login, logout, isAuthenticated } = useAuth();

  const handleLogin = async (credentials) => {
    await login(credentials);
  };

  return (
    <div>
      {isAuthenticated ? (
        <p>Welcome, {user.name}</p>
      ) : (
        <button onClick={() => handleLogin(credentials)}>Login</button>
      )}
    </div>
  );
};
```

### 2. Using Role-Based Access
```jsx
import { useRole } from '../hooks/useRole';

const MyComponent = () => {
  const { isAdmin, isFaculty, hasRole } = useRole();

  return (
    <div>
      {isAdmin() && <AdminPanel />}
      {isFaculty() && <FacultyPanel />}
      {hasRole('student') && <StudentPanel />}
    </div>
  );
};
```

### 3. Using Form Hook
```jsx
import { useForm } from '../hooks/useForm';
import { validateLoginForm } from '../utils/validators';

const LoginForm = () => {
  const { values, errors, handleChange, handleSubmit } = useForm(
    { email: '', password: '' },
    validateLoginForm
  );

  const onSubmit = (data) => {
    console.log('Form data:', data);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <input name="email" value={values.email} onChange={handleChange} />
      {errors.email && <span>{errors.email}</span>}
      <button type="submit">Login</button>
    </form>
  );
};
```

### 4. Using Courses Hook
```jsx
import { useCourses } from '../hooks/useCourses';

const CoursesPage = () => {
  const { courses, isLoading, createCourse } = useCourses();

  const handleCreate = async (data) => {
    await createCourse.mutateAsync(data);
  };

  if (isLoading) return <div>Loading...</div>;

  return (
    <div>
      {courses?.map(course => (
        <div key={course._id}>{course.title}</div>
      ))}
    </div>
  );
};
```

### 5. Using Formatters
```jsx
import { formatDate, formatCurrency, formatRelativeTime } from '../utils/formatters';

const MyComponent = ({ date, amount, timestamp }) => {
  return (
    <div>
      <p>Date: {formatDate(date)}</p>
      <p>Amount: {formatCurrency(amount)}</p>
      <p>Posted: {formatRelativeTime(timestamp)}</p>
    </div>
  );
};
```

### 6. Using Storage Utils
```jsx
import { getToken, setToken, getUser } from '../utils/storage';

const token = getToken();
const user = getUser();
setToken('new-token');
```

### 7. Using Validators
```jsx
import { validateEmail, validatePassword } from '../utils/constants/validationRules';

const isValid = validateEmail('test@example.com');
const isStrongPassword = validatePassword('mypassword123');
```

---

## 🔌 Backend Integration

All contexts and hooks are fully integrated with the backend API:

### AuthContext
- Uses `authAPI.login()` for authentication
- Stores token and user in localStorage
- Auto-logout on 401 errors (handled in axios interceptor)

### NotificationContext
- Uses `studentAPI.getNotifications()`
- Uses `studentAPI.markNotificationRead(id)`
- Auto-refreshes every 60 seconds

### useCourses Hook
- Uses `facultyAPI.getCourses()` for faculty
- Uses `studentAPI.getEnrolledCourses()` for students
- Uses `facultyAPI.createCourse()` for mutations
- React Query for caching and state management

### useAssignments Hook
- Uses `facultyAPI.getAssignments()` for faculty
- Uses `studentAPI.getAssignments()` for students
- Uses `facultyAPI.createAssignment()` for creation
- Uses `studentAPI.submitAssignment()` for submission

---

## ✅ Features

### Contexts
- ✅ Authentication state management
- ✅ Theme management
- ✅ Real-time notifications
- ✅ localStorage persistence
- ✅ Auto-refresh

### Hooks
- ✅ Custom authentication hook
- ✅ localStorage hook
- ✅ Generic API hook
- ✅ Role-based access hook
- ✅ Courses management hook
- ✅ Assignments management hook
- ✅ Form handling hook

### Utils
- ✅ Role constants and routes
- ✅ API endpoint constants
- ✅ Permission matrix
- ✅ Validation rules and functions
- ✅ Helper functions
- ✅ Form validators
- ✅ Data formatters
- ✅ Storage utilities
- ✅ Role utilities

---

## 🎯 Benefits

1. **Reusability**: All hooks and utils can be used across components
2. **Type Safety**: Constants prevent typos in routes and endpoints
3. **Consistency**: Formatters ensure consistent data display
4. **Validation**: Centralized validation rules
5. **State Management**: Context for global state
6. **Backend Integration**: All hooks connected to API
7. **Error Handling**: Built-in error handling in hooks
8. **Performance**: React Query for caching and optimization

---

## 📊 Summary

**Total Files Created**: 25 files
- Contexts: 3 files + 1 index
- Hooks: 7 files + 1 index
- Utils: 10 files + 1 index

**All files are production-ready with:**
- ✅ Backend integration
- ✅ Error handling
- ✅ TypeScript-ready structure
- ✅ Comprehensive documentation
- ✅ Real-world usage examples

**Ready to use in your SECE Course Management System!** 🎉
