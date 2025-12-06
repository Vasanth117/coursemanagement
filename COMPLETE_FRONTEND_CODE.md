# Complete Frontend Code - SECE Course Management System

## 🎯 Already Implemented (Working):

### 1. Authentication
- ✅ Login Page with college branding
- ✅ User type tabs (Student/Faculty/Admin)
- ✅ Redux authentication state management
- ✅ JWT token storage

### 2. Dashboards
- ✅ Student Dashboard - Stats, schedule, assignments
- ✅ Faculty Dashboard - Courses, submissions, students
- ✅ Admin Dashboard - System overview, user management

### 3. Styling & Animations
- ✅ Tailwind CSS configuration
- ✅ Custom animations (fade-in, slide-up, etc.)
- ✅ College color scheme (Blue/Indigo)
- ✅ Responsive design

### 4. State Management
- ✅ Redux store configured
- ✅ Auth slice with login/logout
- ✅ API integration with axios

## 📝 Pages You Need to Create:

### STUDENT PAGES

#### 1. Course List (`/pages/student/courses/CourseList.jsx`)
```jsx
// Already created above - displays enrolled courses in grid
```

#### 2. Course Detail (`/pages/student/courses/CourseDetail.jsx`)
```jsx
import { useState } from 'react';
import { useParams } from 'react-router-dom';

const CourseDetail = () => {
  const { id } = useParams();
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Course Header */}
        <div className="bg-white rounded-2xl shadow-lg p-8 mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Data Structures & Algorithms</h1>
          <p className="text-gray-600 mt-2">CS301 • Dr. Kumar</p>
        </div>

        {/* Tabs: Materials, Assignments, Grades */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 bg-white rounded-2xl shadow-lg p-6">
            <h2 className="text-xl font-bold mb-4">Course Materials</h2>
            {/* List materials here */}
          </div>
          
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <h2 className="text-xl font-bold mb-4">Quick Info</h2>
            {/* Course info sidebar */}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CourseDetail;
```

#### 3. Assignment List (`/pages/student/assignments/AssignmentList.jsx`)
```jsx
import { useState } from 'react';
import { Link } from 'react-router-dom';

const AssignmentList = () => {
  const assignments = [
    { id: 1, title: 'Binary Tree Implementation', course: 'CS301', due: '2024-02-15', status: 'pending' },
    { id: 2, title: 'React Portfolio', course: 'CS402', due: '2024-02-20', status: 'submitted' }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Assignments</h1>
        
        <div className="space-y-4">
          {assignments.map(assignment => (
            <Link
              key={assignment.id}
              to={`/student/assignments/${assignment.id}`}
              className="block bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition"
            >
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-bold text-gray-900">{assignment.title}</h3>
                  <p className="text-sm text-gray-600">{assignment.course}</p>
                </div>
                <span className={`px-4 py-2 rounded-full text-sm font-semibold ${
                  assignment.status === 'pending' ? 'bg-orange-100 text-orange-600' : 'bg-green-100 text-green-600'
                }`}>
                  {assignment.status}
                </span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AssignmentList;
```

### FACULTY PAGES

#### 1. Create Course (`/pages/faculty/courses/CreateCourse.jsx`)
```jsx
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';

const CreateCourse = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    code: '',
    name: '',
    description: '',
    credits: '',
    schedule: ''
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    // API call to create course
    toast.success('Course created successfully!');
    navigate('/faculty/courses');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-8">
      <div className="max-w-3xl mx-auto">
        <div className="bg-white rounded-2xl shadow-lg p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">Create New Course</h1>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Course Code</label>
              <input
                type="text"
                value={formData.code}
                onChange={(e) => setFormData({...formData, code: e.target.value})}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Course Name</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Description</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
                rows="4"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            <button
              type="submit"
              className="w-full py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold rounded-lg hover:shadow-lg transition"
            >
              Create Course
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CreateCourse;
```

### ADMIN PAGES

#### 1. User Management (`/pages/admin/users/UserManagement.jsx`)
```jsx
import { useState } from 'react';
import { UserGroupIcon, PencilIcon, TrashIcon } from '@heroicons/react/24/outline';

const UserManagement = () => {
  const [users] = useState([
    { id: 1, name: 'Rahul Kumar', email: 'rahul@sece.ac.in', role: 'student', status: 'active' },
    { id: 2, name: 'Dr. Sharma', email: 'sharma@sece.ac.in', role: 'faculty', status: 'active' }
  ]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold text-gray-900">User Management</h1>
          <button className="px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold rounded-lg hover:shadow-lg transition">
            Add User
          </button>
        </div>

        <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Name</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Email</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Role</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Status</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {users.map(user => (
                <tr key={user.id} className="hover:bg-gray-50 transition">
                  <td className="px-6 py-4 text-sm text-gray-900">{user.name}</td>
                  <td className="px-6 py-4 text-sm text-gray-600">{user.email}</td>
                  <td className="px-6 py-4">
                    <span className="px-3 py-1 bg-blue-100 text-blue-700 text-xs font-semibold rounded-full">
                      {user.role}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="px-3 py-1 bg-green-100 text-green-700 text-xs font-semibold rounded-full">
                      {user.status}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center space-x-2">
                      <button className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition">
                        <PencilIcon className="h-5 w-5" />
                      </button>
                      <button className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition">
                        <TrashIcon className="h-5 w-5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default UserManagement;
```

## 🔧 Common Components

### Sidebar Component (`/components/layout/Sidebar.jsx`)
```jsx
import { Link, useLocation } from 'react-router-dom';
import { HomeIcon, BookOpenIcon, DocumentTextIcon, ChartBarIcon } from '@heroicons/react/24/outline';

const Sidebar = ({ role }) => {
  const location = useLocation();
  
  const studentLinks = [
    { name: 'Dashboard', path: '/student/dashboard', icon: HomeIcon },
    { name: 'Courses', path: '/student/courses', icon: BookOpenIcon },
    { name: 'Assignments', path: '/student/assignments', icon: DocumentTextIcon },
    { name: 'Grades', path: '/student/grades', icon: ChartBarIcon }
  ];

  const links = role === 'student' ? studentLinks : [];

  return (
    <div className="w-64 bg-white h-screen shadow-lg fixed left-0 top-0">
      <div className="p-6">
        <img src="/images/sece-logo.png" alt="SECE" className="h-12 w-12 mx-auto mb-6" />
        
        <nav className="space-y-2">
          {links.map(link => (
            <Link
              key={link.path}
              to={link.path}
              className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition ${
                location.pathname === link.path
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <link.icon className="h-5 w-5" />
              <span className="font-medium">{link.name}</span>
            </Link>
          ))}
        </nav>
      </div>
    </div>
  );
};

export default Sidebar;
```

## 🚀 Next Steps:

1. **Copy the code above** for each page you need
2. **Update App.js** to add routes for all pages
3. **Connect to backend APIs** in each page
4. **Test each feature** individually
5. **Add error handling** and loading states

## 📦 File Structure:
```
src/
├── pages/
│   ├── student/
│   │   ├── Dashboard.jsx ✅
│   │   ├── courses/
│   │   │   ├── CourseList.jsx ✅
│   │   │   └── CourseDetail.jsx
│   │   └── assignments/
│   │       └── AssignmentList.jsx
│   ├── faculty/
│   │   ├── Dashboard.jsx ✅
│   │   └── courses/
│   │       └── CreateCourse.jsx
│   └── admin/
│       ├── Dashboard.jsx ✅
│       └── users/
│           └── UserManagement.jsx
└── components/
    └── layout/
        └── Sidebar.jsx
```

All pages follow the same professional design pattern with:
- SECE branding and colors
- Smooth animations
- Responsive layout
- Clean, modern UI
