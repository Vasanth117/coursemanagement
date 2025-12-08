import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Provider } from 'react-redux';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { Toaster } from 'react-hot-toast';
import { GoogleOAuthProvider } from '@react-oauth/google';
import store from './store/store';
import { AuthLayout, DashboardLayout, MainLayout } from './components/layout';
import { ProtectedRoute } from './components/auth';
import EnhancedLoginPage from './pages/auth/EnhancedLoginPage';
import RegisterPage from './pages/auth/RegisterPage';
import ResetPasswordPage from './pages/auth/ResetPasswordPage';
import {
  Dashboard as StudentDashboard,
  CoursesIndex as StudentCoursesIndex,
  MyCourses,
  CourseDetails as StudentCourseDetails,
  EnrollCourse,
  AssignmentsIndex as StudentAssignmentsIndex,
  AssignmentDetails as StudentAssignmentDetails,
  SubmitAssignment,
  GradesIndex,
  Schedule,
  Profile,
  Notifications
} from './pages/student';
import {
  Dashboard as FacultyDashboard,
  CoursesIndex,
  CreateCourse,
  CourseDetails,
  EditCourse,
  AssignmentsIndex,
  CreateAssignment,
  AssignmentDetails,
  Submissions,
  GradeAssignment,
  StudentsIndex,
  StudentDetails,
  Attendance,
  Gradebook,
  Announcements,
  Resources
} from './pages/faculty';
import AdminDashboard from './pages/admin/Dashboard';
import { UsersManagement, CreateUser, EditUser, UserDetails, CoursesManagement, Analytics, Settings, Reports } from './pages/admin';
import './index.css';
import './App.css';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000,
      cacheTime: 10 * 60 * 1000,
      retry: 2,
      refetchOnWindowFocus: false,
    },
  },
});

function App() {
  return (
    <GoogleOAuthProvider clientId={process.env.REACT_APP_GOOGLE_CLIENT_ID}>
      <Provider store={store}>
        <QueryClientProvider client={queryClient}>
          <Router>
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 3000,
            style: {
              background: '#363636',
              color: '#fff',
            },
            success: {
              duration: 3000,
              iconTheme: {
                primary: '#10b981',
                secondary: '#fff',
              },
            },
            error: {
              duration: 4000,
              iconTheme: {
                primary: '#ef4444',
                secondary: '#fff',
              },
            },
          }}
        />
        <Routes>
          {/* Auth Routes */}
          <Route element={<AuthLayout />}>
            <Route path="/login" element={<EnhancedLoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/reset-password" element={<ResetPasswordPage />} />
          </Route>

          {/* Student Routes */}
          <Route element={<ProtectedRoute allowedRoles={['student']}><DashboardLayout /></ProtectedRoute>}>
            <Route path="/student/dashboard" element={<StudentDashboard />} />
            <Route path="/student/courses" element={<StudentCoursesIndex />} />
            <Route path="/student/courses/my-courses" element={<MyCourses />} />
            <Route path="/student/courses/:id" element={<StudentCourseDetails />} />
            <Route path="/student/courses/:id/enroll" element={<EnrollCourse />} />
            <Route path="/student/assignments" element={<StudentAssignmentsIndex />} />
            <Route path="/student/assignments/:id" element={<StudentAssignmentDetails />} />
            <Route path="/student/assignments/:id/submit" element={<SubmitAssignment />} />
            <Route path="/student/grades" element={<GradesIndex />} />
            <Route path="/student/schedule" element={<Schedule />} />
            <Route path="/student/profile" element={<Profile />} />
            <Route path="/student/notifications" element={<Notifications />} />
          </Route>

          {/* Faculty Routes */}
          <Route element={<ProtectedRoute allowedRoles={['faculty']}><DashboardLayout /></ProtectedRoute>}>
            <Route path="/faculty/dashboard" element={<FacultyDashboard />} />
            <Route path="/faculty/courses" element={<CoursesIndex />} />
            <Route path="/faculty/courses/create" element={<CreateCourse />} />
            <Route path="/faculty/courses/:id" element={<CourseDetails />} />
            <Route path="/faculty/courses/:id/edit" element={<EditCourse />} />
            <Route path="/faculty/assignments" element={<AssignmentsIndex />} />
            <Route path="/faculty/assignments/create" element={<CreateAssignment />} />
            <Route path="/faculty/assignments/:id" element={<AssignmentDetails />} />
            <Route path="/faculty/assignments/:id/submissions" element={<Submissions />} />
            <Route path="/faculty/assignments/:id/grade/:submissionId" element={<GradeAssignment />} />
            <Route path="/faculty/students" element={<StudentsIndex />} />
            <Route path="/faculty/students/:id" element={<StudentDetails />} />
            <Route path="/faculty/attendance" element={<Attendance />} />
            <Route path="/faculty/gradebook" element={<Gradebook />} />
            <Route path="/faculty/announcements" element={<Announcements />} />
            <Route path="/faculty/resources" element={<Resources />} />
          </Route>

          {/* Admin Routes */}
          <Route element={<ProtectedRoute allowedRoles={['admin']}><DashboardLayout /></ProtectedRoute>}>
            <Route path="/admin/dashboard" element={<AdminDashboard />} />
            <Route path="/admin/users" element={<UsersManagement />} />
            <Route path="/admin/users/create" element={<CreateUser />} />
            <Route path="/admin/users/:id" element={<UserDetails />} />
            <Route path="/admin/users/:id/edit" element={<EditUser />} />
            <Route path="/admin/courses" element={<CoursesManagement />} />
            <Route path="/admin/analytics" element={<Analytics />} />
            <Route path="/admin/settings" element={<Settings />} />
            <Route path="/admin/reports" element={<Reports />} />
          </Route>

          {/* Default Routes */}
          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
          </Router>
          <ReactQueryDevtools initialIsOpen={false} />
        </QueryClientProvider>
      </Provider>
    </GoogleOAuthProvider>
  );
}

export default App;
